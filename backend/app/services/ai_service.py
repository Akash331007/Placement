import os
import json
import re
import logging
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

# Attempt to import google-generativeai. If not installed or configured, it will fall back to mock.
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

# List of common skills for our fallback local parser
COMMON_SKILLS_LIST = [
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "flask", "fastapi", "spring boot",
    "html", "css", "tailwind", "sass", "bootstrap",
    "sql", "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch", "firebase", "cassandra",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "gitlab", "jenkins", "terraform", "ansible",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
    "data analysis", "tableau", "power bi", "excel", "spark", "hadoop", "graphql", "rest api", "grpc", "microservices",
    "agile", "scrum", "project management", "communication", "leadership", "problem solving", "unit testing", "ci/cd"
]

DEFAULT_JOB_SKILLS = {
    "Python Developer": ["python", "django", "flask", "fastapi", "sql", "postgresql", "git", "rest api", "docker", "unit testing"],
    "Full Stack Developer": ["html", "css", "javascript", "typescript", "react", "node.js", "express", "sql", "git", "aws", "docker"],
    "Java Developer": ["java", "spring boot", "hibernate", "sql", "mysql", "git", "microservices", "docker", "maven", "junit"],
    "Data Analyst": ["python", "sql", "excel", "pandas", "numpy", "tableau", "power bi", "data visualization", "communication", "statistics"],
    "AI Engineer": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "git", "scikit-learn", "aws"]
}

def clean_json_response(text: str) -> str:
    """Strips markdown code blocks (e.g. ```json ... ```) from a text response."""
    text = text.strip()
    # Match ```json ... ``` or ``` ... ```
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text

def parse_json_safely(text: str, fallback_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Tries to parse JSON from text, returning a fallback dictionary on failure."""
    try:
        cleaned = clean_json_response(text)
        return json.loads(cleaned)
    except Exception as e:
        logger.exception("Failed to parse JSON response: %s. Text received: %s", e, text)
        return fallback_dict

def get_gemini_client(user_api_key: Optional[str] = None):
    """Initializes and returns the Gemini model if an API key is available."""
    api_key = user_api_key or settings.GEMINI_API_KEY
    if not api_key:
        return None
    
    if HAS_GEMINI:
        try:
            genai.configure(api_key=api_key)
            # Use gemini-1.5-flash as the default fast and capable model
            return genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            logger.exception("Error configuring Gemini client: %s", e)
            return None
    return None

# ==========================================
# MOCK / FALLBACK AI GENERATION METHODS
# ==========================================

def local_regex_parse(raw_text: str) -> Dict[str, Any]:
    """Extracts structural fields from raw resume text using regex and heuristics."""
    text_lower = raw_text.lower()
    
    # 1. Email extraction
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
    email = email_match.group(0) if email_match else None
    
    # 2. Phone extraction
    phone_match = re.search(r'\(?\+?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}', raw_text)
    phone = phone_match.group(0) if phone_match else None
    
    # 3. Name extraction (highly approximate fallback: first non-empty line)
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    name = "Candidate Name"
    for line in lines:
        # Ignore lines with email or phone or common sections
        if email and email in line:
            continue
        if phone and phone in line:
            continue
        if len(line) < 30 and re.match(r'^[a-zA-Z\s]+$', line):
            name = line
            break
            
    # 4. Skills extraction matching against COMMON_SKILLS_LIST
    skills = []
    for skill in COMMON_SKILLS_LIST:
        # Match as whole word to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Format nicely
            skills.append(skill.upper() if len(skill) <= 3 else skill.title())
            
    # 5. Education parsing heuristic
    education = []
    edu_keywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.s", "m.s", "degree", "university", "college", "institute"]
    for keyword in edu_keywords:
        pattern = r'([^.\n]*?' + re.escape(keyword) + r'[^.\n]*)'
        matches = re.findall(pattern, text_lower)
        for match in matches:
            match_clean = match.strip()
            if len(match_clean) > 10 and match_clean not in [e.get("degree") for e in education]:
                education.append({
                    "degree": match_clean.title()[:60],
                    "institution": "University / Institution Details",
                    "year": "2020-2024"
                })
                if len(education) >= 3:
                    break
        if len(education) >= 3:
            break
            
    # 6. Experience parsing heuristic
    experience = []
    exp_keywords = ["developer", "engineer", "analyst", "intern", "manager", "lead", "specialist", "consultant"]
    for keyword in exp_keywords:
        pattern = r'([^.\n]*?' + re.escape(keyword) + r'[^.\n]*)'
        matches = re.findall(pattern, text_lower)
        for match in matches:
            match_clean = match.strip()
            if len(match_clean) > 15 and match_clean not in [ex.get("role") for ex in experience]:
                experience.append({
                    "role": match_clean.title()[:60],
                    "company": "Company Name",
                    "duration": "1-2 years",
                    "description": "Led development of core modules, optimizing database queries and system components."
                })
                if len(experience) >= 3:
                    break
        if len(experience) >= 3:
            break
            
    # 7. Projects parsing heuristic
    projects = []
    proj_patterns = [r'project\b', r'portfolio\b', r'github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+']
    for pattern_str in proj_patterns:
        matches = re.findall(r'([^.\n]*?' + pattern_str + r'[^.\n]*)', text_lower)
        for match in matches:
            match_clean = match.strip()
            if len(match_clean) > 15 and match_clean not in [p.get("title") for p in projects]:
                projects.append({
                    "title": match_clean.title()[:40],
                    "description": "Implemented web features and backend integration.",
                    "technologies": skills[:3]
                })
                if len(projects) >= 3:
                    break
        if len(projects) >= 3:
            break

    # 8. Certifications
    certifications = []
    cert_keywords = ["aws", "certified", "azure", "gcp", "scrum", "oracle", "cisco"]
    for keyword in cert_keywords:
        pattern = r'([^.\n]*?' + re.escape(keyword) + r'[^.\n]*)'
        matches = re.findall(pattern, text_lower)
        for match in matches:
            match_clean = match.strip()
            if len(match_clean) > 10 and match_clean not in certifications:
                certifications.append(match_clean.title()[:50])
                if len(certifications) >= 3:
                    break
        if len(certifications) >= 3:
            break

    # 9. Languages
    languages = []
    lang_list = ["english", "spanish", "french", "german", "mandarin", "hindi", "japanese", "arabic"]
    for lang in lang_list:
        if re.search(r'\b' + re.escape(lang) + r'\b', text_lower):
            languages.append(lang.title())

    return {
        "name": name,
        "email": email or "candidate@example.com",
        "phone": phone or "+1-555-0199",
        "education": education if education else [{"degree": "Bachelor of Science in Computer Science", "institution": "State University", "year": "2022"}],
        "skills": skills if skills else ["Python", "JavaScript", "SQL", "Git", "HTML/CSS"],
        "projects": projects if projects else [{"title": "Personal Portfolio", "description": "Developed dynamic personal showcase site using React.", "technologies": ["React", "CSS"]}],
        "certifications": certifications if certifications else ["Certified ScrumMaster (CSM)"],
        "experience": experience if experience else [{"role": "Software Engineering Intern", "company": "Tech Solutions Inc.", "duration": "3 months", "description": "Assisted in code maintenance and feature updates."}],
        "languages": languages if languages else ["English"]
    }

def local_generate_analysis(parsed_json: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    """Simulates ATS scoring and resume analysis based on the parsed fields."""
    skills = parsed_json.get("skills", [])
    experience = parsed_json.get("experience", [])
    projects = parsed_json.get("projects", [])
    education = parsed_json.get("education", [])
    
    # Calculate scores based on resume completeness
    structure_score = 40
    if len(skills) > 0: structure_score += 15
    if len(experience) > 0: structure_score += 15
    if len(projects) > 0: structure_score += 15
    if len(education) > 0: structure_score += 15
    structure_score = min(structure_score, 100)
    
    # Keyword score based on skill length
    keyword_score = min(40 + len(skills) * 4, 100)
    
    # Formatting score
    formatting_score = 90
    weak_sections = []
    if not parsed_json.get("phone") or parsed_json.get("phone") == "+1-555-0199":
        formatting_score -= 10
        weak_sections.append("Contact Information (Mock phone placeholder)")
    if len(projects) < 2:
        weak_sections.append("Projects Section (Add more academic or side projects)")
    if len(experience) < 1:
        weak_sections.append("Work Experience (Lacks formal professional records)")

    # Readability score based on raw text length
    word_count = len(raw_text.split())
    if word_count < 150:
        readability_score = 50
        weak_sections.append("Resume Length (Resume is too short; add details to achievements)")
    elif word_count > 800:
        readability_score = 65
        weak_sections.append("Resume Length (Resume is too wordy; consolidate to 1-2 pages)")
    else:
        readability_score = 85

    ats_score = int((structure_score * 0.3) + (keyword_score * 0.3) + (formatting_score * 0.2) + (readability_score * 0.2))

    # Missing general keywords
    missing_keywords = []
    if "docker" not in [s.lower() for s in skills]:
        missing_keywords.append("Docker Containerization")
    if "ci/cd" not in [s.lower() for s in skills] and "jenkins" not in [s.lower() for s in skills]:
        missing_keywords.append("CI/CD Pipelines")
    if "aws" not in [s.lower() for s in skills] and "cloud" not in raw_text.lower():
        missing_keywords.append("Cloud Computing (AWS/Azure)")

    missing_skills = [kw for kw in missing_keywords]
    
    # Repeated words & grammar
    repeated_words = ["developed", "assisted", "worked"]
    grammar_issues = [
        "Change passive sentences to active: e.g., 'Was responsible for writing code' -> 'Programmed microservices'."
    ]
    
    suggestions = {
        "summary": "Create a strong 3-4 sentence professional summary focusing on your main skills and impact rather than objectives.",
        "projects": "In project descriptions, focus on the 'why' and 'how' and include tools/languages used.",
        "skills": "Group skills by categories (e.g., Languages, Frameworks, Developer Tools) to improve ATS parsability.",
        "experience": "Ensure each bullet point in your experience starts with a strong action verb (e.g., Designed, Orchestrated, Spearheaded).",
        "achievements": "Quantify your achievements! Instead of 'Optimized website speed', use 'Boosted webpage loading speeds by 30% through caching optimization'.",
        "keywords": "Add industry standard terms matching the job descriptions you are targeting."
    }

    return {
        "ats_score": ats_score,
        "structure_score": structure_score,
        "keyword_score": keyword_score,
        "formatting_score": formatting_score,
        "readability_score": readability_score,
        "missing_skills": missing_skills,
        "weak_sections": weak_sections,
        "repeated_words": repeated_words,
        "grammar_issues": grammar_issues,
        "missing_keywords": missing_keywords,
        "suggestions": suggestions
    }

# ==========================================
# PUBLIC INTERFACE (ROUTER INTEGRATION)
# ==========================================

def parse_resume(raw_text: str, user_api_key: Optional[str] = None) -> Dict[str, Any]:
    """Parses raw text structure. Interacts with Gemini API or falls back to local regex."""
    client = get_gemini_client(user_api_key)
    fallback = local_regex_parse(raw_text)
    
    if not client:
        logger.info("Using local mock parsing engine...")
        return fallback
    
    prompt = f"""
    You are an expert AI resume parser. Parse the following raw text extracted from a resume.
    Extract key information and return it STRICTLY as a valid JSON object matching this structure:
    {{
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "+1-123-456-7890",
      "education": [
        {{
          "degree": "Bachelor of Science in Computer Science",
          "institution": "University Name",
          "year": "2020-2024"
        }}
      ],
      "skills": ["Python", "JavaScript", "Docker"],
      "projects": [
        {{
          "title": "E-Commerce App",
          "description": "Created shopping cart features and API integrations",
          "technologies": ["React", "Node.js"]
        }}
      ],
      "certifications": ["AWS Certified Solutions Architect"],
      "experience": [
        {{
          "role": "Software Engineer",
          "company": "Tech Corp",
          "duration": "June 2024 - Present",
          "description": "Implemented microservices, reviewed code, and updated cloud infrastructure."
        }}
      ],
      "languages": ["English", "French"]
    }}

    If a section is completely missing, return an empty list or null value. Do not write explanations, do not wrap with markdown code tags other than json if necessary.
    
    Resume Text:
    {raw_text}
    """
    
    try:
        response = client.generate_content(prompt)
        return parse_json_safely(response.text, fallback)
    except Exception as e:
        logger.exception("Gemini API parsing failed: %s. Falling back to local parser.", e)
        return fallback

def analyze_resume(parsed_json: Dict[str, Any], raw_text: str, user_api_key: Optional[str] = None) -> Dict[str, Any]:
    """Performs ATS compatibility scoring and detailed resume feedback."""
    client = get_gemini_client(user_api_key)
    fallback = local_generate_analysis(parsed_json, raw_text)
    
    if not client:
        logger.info("Using local mock analysis engine...")
        return fallback

    prompt = f"""
    You are an expert Applicant Tracking System (ATS) and professional resume reviewer.
    Analyze the following resume details (provided as JSON) and raw text.
    Calculate scores out of 100, identify areas of improvement, and return the details.
    You MUST respond STRICTLY with a valid JSON object matching this exact structure:
    {{
      "ats_score": 78,
      "structure_score": 85,
      "keyword_score": 70,
      "formatting_score": 80,
      "readability_score": 75,
      "missing_skills": ["Docker", "Kubernetes"],
      "weak_sections": ["Summary is missing", "Experience lacks quantifiable outcomes"],
      "repeated_words": ["developed", "helped"],
      "grammar_issues": ["Change 'responsible for coding' to 'Engineered'"],
      "missing_keywords": ["RESTful API", "Agile Methodology"],
      "suggestions": {{
        "summary": "Write a descriptive summary...",
        "projects": "Quantify outcomes in your projects...",
        "skills": "Organize skills chronologically or by domain...",
        "experience": "Begin bullet points with action words...",
        "achievements": "Add numerical achievements like % optimization...",
        "keywords": "Add targeted keyword definitions..."
      }}
    }}
    
    Parsed Resume:
    {json.dumps(parsed_json, indent=2)}

    Raw Resume Text:
    {raw_text}
    """
    
    try:
        response = client.generate_content(prompt)
        return parse_json_safely(response.text, fallback)
    except Exception as e:
        logger.exception("Gemini API analysis failed: %s. Falling back to local analysis.", e)
        return fallback

def analyze_skill_gap(parsed_json: Dict[str, Any], target_role: str, db_required_skills: List[str] = None, user_api_key: Optional[str] = None) -> Dict[str, Any]:
    """Compares the user's resume skills against a target job role."""
    client = get_gemini_client(user_api_key)
    
    user_skills = [s.lower().strip() for s in parsed_json.get("skills", [])]
    required_skills = db_required_skills or DEFAULT_JOB_SKILLS.get(target_role, ["python", "sql", "git"])
    
    # Calculate mock/local response
    current_skills_matched = [s for s in required_skills if any(s in us or us in s for us in user_skills)]
    # Capitalize matched skills based on how user has them
    current_skills_display = []
    for s in current_skills_matched:
        match_orig = [us for us in parsed_json.get("skills", []) if s in us.lower() or us.lower() in s]
        current_skills_display.append(match_orig[0] if match_orig else s.title())
        
    missing_skills = [s.title() for s in required_skills if s not in current_skills_matched]
    suggested_skills = [s + " certification" if "aws" in s or "cloud" in s else s.title() for s in missing_skills]
    priority_order = [s.title() for s in missing_skills]

    fallback = {
        "target_role": target_role,
        "current_skills": current_skills_display,
        "missing_skills": missing_skills,
        "suggested_skills": suggested_skills,
        "priority_order": priority_order
    }

    if not client:
        return fallback

    prompt = f"""
    Compare this candidate's parsed skills with the target job role '{target_role}'.
    Required typical skills for this role: {', '.join(required_skills)}.
    Provide matching, missing, suggested skills and a priority order for learning.
    You MUST respond STRICTLY with a valid JSON object matching this structure:
    {{
      "target_role": "{target_role}",
      "current_skills": ["Skill1", "Skill2"],
      "missing_skills": ["Missing1", "Missing2"],
      "suggested_skills": ["Suggested1", "Suggested2"],
      "priority_order": ["Missing1", "Missing2"]
    }}
    
    Candidate Skills:
    {json.dumps(parsed_json.get("skills", []))}
    """
    
    try:
        response = client.generate_content(prompt)
        return parse_json_safely(response.text, fallback)
    except Exception as e:
        logger.exception("Gemini API skill gap analysis failed: %s. Using local overlap parser.", e)
        return fallback

def generate_recommendations_and_roadmap(parsed_json: Dict[str, Any], user_api_key: Optional[str] = None) -> Dict[str, Any]:
    """Recommends relevant roles and builds a customized learning roadmap."""
    client = get_gemini_client(user_api_key)
    
    # Local fallback logic: calculate scores for standard profiles
    user_skills = [s.lower() for s in parsed_json.get("skills", [])]
    roles_scored = []
    for role, req_skills in DEFAULT_JOB_SKILLS.items():
        overlap = len([s for s in req_skills if any(s in us or us in s for us in user_skills)])
        confidence = float(min(0.3 + (overlap / len(req_skills)) * 0.6, 0.95))
        # Add slight random fluctuation for realism
        confidence = round(confidence, 2)
        roles_scored.append((role, confidence))
        
    # Sort by confidence
    roles_scored.sort(key=lambda x: x[1], reverse=True)
    
    recommended_roles = []
    for role, conf in roles_scored[:3]:
        recommended_roles.append({
            "role": role,
            "confidence": conf,
            "details": f"Matches {int(conf * 100)}% of candidate profile based on technical keywords and resume structure."
        })
    # If no good match, add a default intern or general role
    if not recommended_roles:
        recommended_roles = [
            {"role": "Junior Developer", "confidence": 0.65, "details": "Good baseline engineering skills. Needs frameworks specialization."},
            {"role": "Software Engineer Intern", "confidence": 0.60, "details": "Applicable for freshers to gain initial experience."}
        ]

    # Generate a mock roadmap
    top_role = recommended_roles[0]["role"]
    missing_for_top = [s.title() for s in DEFAULT_JOB_SKILLS.get(top_role, ["git"]) if s not in user_skills]
    if not missing_for_top:
        missing_for_top = ["Docker", "Kubernetes", "GraphQL", "AWS Lambda"]
        
    learning_roadmap = {
        "skills_to_learn": missing_for_top,
        "suggested_projects": [
            {
                "title": f"Production-Grade {top_role} Project",
                "description": f"Build and host an application showcasing {', '.join(missing_for_top[:2])}.",
                "difficulty": "Intermediate"
            },
            {
                "title": "Cloud-Native API Deployment",
                "description": "Dockerize the application and set up an automated CI/CD deployment pipeline.",
                "difficulty": "Advanced"
            }
        ],
        "recommended_certs": [
            "AWS Certified Developer" if "aws" in [s.lower() for s in missing_for_top] else "Google Cloud Certified Associate Cloud Engineer",
            f"Official {top_role} Certification or Bootcamp"
        ],
        "practice_schedule": [
            "Week 1-2: Focus on core syntax and concepts of " + (missing_for_top[0] if missing_for_top else "new languages"),
            "Week 3-4: Build the suggested intermediate project, commit code to GitHub",
            "Week 5-6: Deploy the project, dockerize it, and integrate API security",
            "Week 7-8: Apply to roles with updated resume keywords"
        ]
    }

    fallback = {
        "recommended_roles": recommended_roles,
        "learning_roadmap": learning_roadmap
    }

    if not client:
        return fallback

    prompt = f"""
    Based on the following candidate resume profile, recommend 3-5 suitable job roles (with confidence percentages 0.0 - 1.0 and details) and design a customized learning roadmap to help them upskill.
    You MUST respond STRICTLY with a valid JSON object matching this structure:
    {{
      "recommended_roles": [
        {{
          "role": "Python Developer",
          "confidence": 0.85,
          "details": "Strong matching python expertise..."
        }}
      ],
      "learning_roadmap": {{
        "skills_to_learn": ["Docker", "FastAPI"],
        "suggested_projects": [
          {{
            "title": "Project Title",
            "description": "Project details...",
            "difficulty": "Intermediate"
          }}
        ],
        "recommended_certs": ["Certified Kubernetes Administrator"],
        "practice_schedule": ["Week 1: Learn X", "Week 2: Build Y"]
      }}
    }}
    
    Resume details:
    {json.dumps(parsed_json, indent=2)}
    """
    
    try:
        response = client.generate_content(prompt)
        return parse_json_safely(response.text, fallback)
    except Exception as e:
        logger.exception("Gemini API roadmap generation failed: %s. Using local roadmap generator.", e)
        return fallback


def generate_cover_letter(parsed_json: Dict[str, Any], job_description: str, user_api_key: Optional[str] = None) -> str:
    """Generates a professional cover letter based on resume profile and job description."""
    client = get_gemini_client(user_api_key)
    
    name = parsed_json.get("name", "Candidate")
    skills = ", ".join(parsed_json.get("skills", [])[:5])
    experience = parsed_json.get("experience", [{}])
    recent_company = experience[0].get("company", "previous organization") if experience else "previous organization"
    recent_role = experience[0].get("role", "Software Professional") if experience else "Software Professional"
    
    fallback = f"""Dear Hiring Manager,

I am writing to express my enthusiastic interest in the position described in your job posting. Based on my background in software engineering, project execution, and technical design, I believe I would be an excellent fit for your team.

Throughout my career, I have developed strong skills in technologies like {skills}. In my previous role as a {recent_role} at {recent_company}, I was responsible for spearheading development efforts, collaborating with cross-functional teams, and implementing scalable solutions that align with business needs. 

I am particularly drawn to your organization's mission and would welcome the opportunity to bring my hands-on technical skills and collaborative mindset to your projects. Thank you for your time and consideration, and I look forward to discussing how my experience fits your requirements.

Sincerely,

{name}
"""
    if not client:
        return fallback

    prompt = f"""
    You are an expert copywriter. Write a highly compelling, professional, and tailored cover letter
    for a candidate named {name} based on their resume profile (JSON format) and the target job description.
    Make the cover letter read naturally, highlight relevant achievements, and keep it under 400 words.
    Return ONLY the cover letter text. Do not wrap in extra commentary or JSON tags.
    
    Resume details:
    {json.dumps(parsed_json, indent=2)}
    
    Job Description:
    {job_description}
    """
    
    try:
        response = client.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.exception("Gemini cover letter generation failed: %s. Using template.", e)
        return fallback


def generate_interview_questions(parsed_json: Dict[str, Any], job_title: str, user_api_key: Optional[str] = None) -> List[Dict[str, str]]:
    """Generates 5 tailored technical and behavioral interview questions and mock answers."""
    client = get_gemini_client(user_api_key)
    
    skills = parsed_json.get("skills", [])
    skills_str = ", ".join(skills[:4]) if skills else "software engineering"
    
    fallback = [
        {
            "question": f"Can you tell me about your experience working with {skills_str}?",
            "answer": f"In my projects, I actively utilized {skills_str} to build scalable features. For instance, I structured application schemas and implemented robust logic, allowing for faster response times and reliable operation."
        },
        {
            "question": "How do you handle debugging a complex codebase or resolving a performance bottleneck?",
            "answer": "I start by reproducing the issue in an isolated environment and reviewing execution logs. I use profiling tools to trace slow database calls or CPU bottlenecks, refactoring queries or introducing caching as appropriate."
        },
        {
            "question": f"What is your approach to learning a new framework or technology required for a role like {job_title}?",
            "answer": "I read the official documentation, complete standard tutorials, and immediately build a simple proof-of-concept project. I find that applying new concepts directly is the fastest way to understand best practices."
        },
        {
            "question": "Describe a situation where you had a disagreement with a team member. How did you resolve it?",
            "answer": "I scheduled a one-on-one session to listen to their perspective first. By focusing on data and architectural advantages rather than personal preferences, we found a compromise that benefited the codebase."
        },
        {
            "question": "How do you ensure your work stays organized and tasks are delivered on time?",
            "answer": "I break larger tasks into granular checklists and use tools like Jira or Trello to track progress. I prioritize issues by risk and complexity, addressing potential bottlenecks early in the sprint cycle."
        }
    ]
    
    if not client:
        return fallback

    prompt = f"""
    Based on the candidate's resume (JSON format) and the target job title '{job_title}',
    generate 5 highly relevant technical and behavioral interview questions along with ideal answers
    customized to their background and target role.
    You MUST respond STRICTLY with a valid JSON array of objects, containing 'question' and 'answer' keys:
    [
      {{
        "question": "Question text...",
        "answer": "Ideal suggested answer..."
      }}
    ]
    
    Resume details:
    {json.dumps(parsed_json, indent=2)}
    """
    
    try:
        response = client.generate_content(prompt)
        return parse_json_safely(response.text, fallback)
    except Exception as e:
        logger.exception("Gemini interview questions generation failed: %s. Using default interview set.", e)
        return fallback


def optimize_linkedin(parsed_json: Dict[str, Any], user_api_key: Optional[str] = None) -> Dict[str, Any]:
    """Generates an optimized LinkedIn summary and bullet points for the profile experience."""
    client = get_gemini_client(user_api_key)
    
    name = parsed_json.get("name", "Candidate")
    skills = ", ".join(parsed_json.get("skills", [])[:6])
    
    fallback = {
        "summary": f"Passionate Software Professional specializing in full-stack development, database architecture, and high-performance algorithms. Experienced in leveraging technologies like {skills} to design and deploy modern, user-centric web applications and scalable APIs.",
        "experience_bullets": [
            "Engineered high-performance RESTful APIs, reducing query latencies by 25% using caching and query optimization.",
            "Designed and implemented responsive frontend user interfaces, increasing active user engagement metric by 15%.",
            "Orchestrated continuous deployment pipelines to automate builds, testing, and cloud deployments."
        ]
    }
    
    if not client:
        return fallback

    prompt = f"""
    Based on the candidate's resume profile (JSON format), generate an optimized LinkedIn profile update.
    This must include:
    1. A professional LinkedIn 'About' summary (150-250 words, engaging tone, first person).
    2. A list of 3-5 high-impact experience bullet points with strong action verbs and quantified achievements.
    
    You MUST respond STRICTLY with a valid JSON object matching this structure:
    {{
      "summary": "LinkedIn Summary text...",
      "experience_bullets": [
        "Bullet point 1 with metric...",
        "Bullet point 2 with metric..."
      ]
    }}
    
    Resume details:
    {json.dumps(parsed_json, indent=2)}
    """
    
    try:
        response = client.generate_content(prompt)
        return parse_json_safely(response.text, fallback)
    except Exception as e:
        logger.exception("Gemini LinkedIn optimization failed: %s. Using fallback generator.", e)
        return fallback

