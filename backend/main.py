import os
import random
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Student, Course, Attendance, Notice, MapNode, SystemMetric, Faculty, Grade

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusOS Enterprise Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC VALIDATION SCHEMAS ---
class StudentCreate(BaseModel):
    roll_number: str
    name: str
    gender: str
    dob: str
    blood_group: str = ""
    photo_url: str = ""
    mobile: str = ""
    email: str
    perm_address: str = ""
    current_address: str = ""
    parent_name: str = ""
    parent_contact: str = ""
    admission_number: str = ""
    department: str = ""
    course: str
    semester: str = "1"
    section: str = "A"
    batch: str = ""
    admission_date: str = ""
    advisor: str = ""
    aadhaar_input: str = "" # User text ingestion
    passport_number: str = ""
    college_id: str = ""
    hostel_name: str = ""
    room_number: str = ""
    warden_name: str = ""
    hostel_checkin: str = ""
    bus_route: str = ""
    boarding_point: str = ""
    bus_pass_number: str = ""
    attendance_pct: float = 100.0
    leave_records: str = ""
    internal_marks: str = ""
    gpa_metrics: str = ""
    backlogs: int = 0
    tuition_status: str = "Unpaid"
    scholarship_details: str = ""
    pending_dues: float = 0.0
    library_card: str = ""
    books_issued: str = ""
    library_fine: float = 0.0
    medical_conditions: str = ""
    emergency_contact: str = ""
    allergies: str = ""
    clubs: str = ""
    sports: str = ""
    responsibilities: str = ""
    achievements: str = ""
    resume_status: str = "Not Submitted"
    internship_details: str = ""
    placement_status: str = "Unplaced"
    company_placed: str = ""

class CourseCreate(BaseModel):
    code: str
    title: str
    credits: int
    instructor: str

class AttendanceLog(BaseModel):
    student_name: str
    course_code: str
    date: str
    status: str

class NoticeCreate(BaseModel):
    title: str
    content: str
    category: str

class MapNodeCreate(BaseModel):
    name: str
    type: str
    location_details: str

class FacultyCreate(BaseModel):
    faculty_id: str
    name: str
    email: str
    department: str = ""
    designation: str = ""
    office_location: str = ""
    mobile: str = ""

class GradeCreate(BaseModel):
    student_roll: str
    course_code: str
    grade: str
    marks: float = 0.0
    comments: str = ""

class AIQuery(BaseModel):
    query: str

try:
    ai_client = genai.Client()
except Exception as e:
    print(f"Warning: AI initialization status: {e}")
    ai_client = None

# --- API ROUTES ---

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "CampusOS Enterprise Core Operational", "status": "Online"}

@app.get("/api/v1/system/metrics")
def get_system_metrics(db: Session = Depends(get_db)):
    return {
        "cpu_load": round(random.uniform(5.0, 20.0), 1),
        "memory_usage": round(random.uniform(30.0, 50.0), 1),
        "network_latency": f"{random.randint(1, 8)}ms"
    }

@app.post("/api/v1/students")
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    masked_aadhaar = "[AADHAAR REDACTED SECURELY]" if student.aadhaar_input else "Not Provided"
    
    db_student = Student(
        roll_number=student.roll_number, name=student.name, gender=student.gender, dob=student.dob,
        blood_group=student.blood_group, photo_url=student.photo_url, mobile=student.mobile,
        email=student.email, perm_address=student.perm_address, current_address=student.current_address,
        parent_name=student.parent_name, parent_contact=student.parent_contact,
        admission_number=student.admission_number, department=student.department, course=student.course,
        semester=student.semester, section=student.section, batch=student.batch,
        admission_date=student.admission_date, advisor=student.advisor, aadhaar_vault=masked_aadhaar,
        passport_number=student.passport_number, college_id=student.college_id,
        hostel_name=student.hostel_name, room_number=student.room_number, warden_name=student.warden_name,
        hostel_checkin=student.hostel_checkin, bus_route=student.bus_route, boarding_point=student.boarding_point,
        bus_pass_number=student.bus_pass_number, attendance_pct=student.attendance_pct,
        leave_records=student.leave_records, internal_marks=student.internal_marks, gpa_metrics=student.gpa_metrics,
        backlogs=student.backlogs, tuition_status=student.tuition_status, scholarship_details=student.scholarship_details,
        pending_dues=student.pending_dues, library_card=student.library_card, books_issued=student.books_issued,
        library_fine=student.library_fine, medical_conditions=student.medical_conditions,
        emergency_contact=student.emergency_contact, allergies=student.allergies, clubs=student.clubs,
        sports=student.sports, responsibilities=student.responsibilities, achievements=student.achievements,
        resume_status=student.resume_status, internship_details=student.internship_details,
        placement_status=student.placement_status, company_placed=student.company_placed
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/api/v1/students")
def get_all_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

@app.post("/api/v1/courses")
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    db_course = Course(code=course.code, title=course.title, credits=course.credits, instructor=course.instructor)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@app.get("/api/v1/courses")
def get_all_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@app.post("/api/v1/attendance")
def log_attendance(att: AttendanceLog, db: Session = Depends(get_db)):
    db_att = Attendance(student_name=att.student_name, course_code=att.course_code, date=att.date, status=att.status)
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

@app.get("/api/v1/attendance")
def get_all_attendance(db: Session = Depends(get_db)):
    return db.query(Attendance).all()

@app.post("/api/v1/notices")
def create_notice(notice: NoticeCreate, db: Session = Depends(get_db)):
    db_notice = Notice(title=notice.title, content=notice.content, category=notice.category)
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    return db_notice

@app.get("/api/v1/notices")
def get_all_notices(db: Session = Depends(get_db)):
    return db.query(Notice).all()

@app.post("/api/v1/map-nodes")
def create_map_node(node: MapNodeCreate, db: Session = Depends(get_db)):
    db_node = MapNode(name=node.name, type=node.type, location_details=node.location_details)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

@app.get("/api/v1/map-nodes")
def get_all_map_nodes(db: Session = Depends(get_db)):
    return db.query(MapNode).all()

# --- NEW FACULTY & GRADES API ROUTES ---

@app.post("/api/v1/faculty")
def create_faculty(fac: FacultyCreate, db: Session = Depends(get_db)):
    db_fac = Faculty(
        faculty_id=fac.faculty_id, name=fac.name, email=fac.email,
        department=fac.department, designation=fac.designation,
        office_location=fac.office_location, mobile=fac.mobile
    )
    db.add(db_fac)
    db.commit()
    db.refresh(db_fac)
    return db_fac

@app.get("/api/v1/faculty")
def get_all_faculty(db: Session = Depends(get_db)):
    return db.query(Faculty).all()

@app.post("/api/v1/grades")
def create_grade(grd: GradeCreate, db: Session = Depends(get_db)):
    db_grd = Grade(
        student_roll=grd.student_roll, course_code=grd.course_code,
        grade=grd.grade, marks=grd.marks, comments=grd.comments
    )
    db.add(db_grd)
    db.commit()
    db.refresh(db_grd)
    return db_grd

@app.get("/api/v1/grades")
def get_all_grades(db: Session = Depends(get_db)):
    return db.query(Grade).all()

@app.get("/api/v1/grades/student/{roll_number}")
def get_student_grades(roll_number: str, db: Session = Depends(get_db)):
    return db.query(Grade).filter(Grade.student_roll == roll_number).all()

@app.post("/api/v1/ai/query")
def ask_gemma(data: AIQuery, db: Session = Depends(get_db)):
    if not ai_client:
        raise HTTPException(status_code=500, detail="AI cluster link down.")
    try:
        all_students = db.query(Student).all()
        all_courses = db.query(Course).all()
        all_notices = db.query(Notice).all()
        all_faculty = db.query(Faculty).all()
        all_grades = db.query(Grade).all()
        
        # Build faculty context
        faculty_str = ""
        for f in all_faculty:
            faculty_str += f"- Faculty: {f.name} (ID: {f.faculty_id}, Dept: {f.department}, Title: {f.designation}, Office: {f.office_location})\n"
            
        # Build student performance & grades context
        student_str = ""
        for s in all_students:
            student_grades = [g for g in all_grades if g.student_roll == s.roll_number]
            grades_summary = ", ".join([f"{g.course_code}: {g.grade} ({g.marks} marks)" for g in student_grades]) if student_grades else "No grades posted"
            
            student_str += (
                f"- Student: {s.name} (Roll: {s.roll_number}, Course: {s.course})\n"
                f"  Academic: Sem {s.semester}, Dept: {s.department}, Advisor: {s.advisor}, GPA: {s.gpa_metrics}, Attendance: {s.attendance_pct}%\n"
                f"  Grades Logged: {grades_summary}\n"
                f"  Financials: Tuition {s.tuition_status}, Dues: ${s.pending_dues}\n"
                f"  Logistics: Hostel {s.hostel_name} Room {s.room_number}, Transport Route {s.bus_route}\n"
                f"  Placement: Status {s.placement_status}, Placed at {s.company_placed}\n"
                f"  Ident: ID Number: {s.college_id}\n"
            )

        system_instruction = (
            "You are the central academic advisor and administrative intelligence core for CampusOS.\n"
            "You assist university professors, department heads, and academic advisors in monitoring academic performance, grade distributions, leave trends, advisory alerts, and logistics.\n"
            "Provide highly professional, structured, concise, and actionable guidance without exposing sensitive placeholders.\n\n"
            f"--- UNIVERSITY FACULTY REGISTRY ---\n{faculty_str if faculty_str else 'No faculty currently registered.'}\n\n"
            f"--- ACADEMIC STUDENT REGISTRY & GRADE RECORDS ---\n{student_str}"
        )

        response = ai_client.models.generate_content(
            model="gemma-4-26b-a4b-it",
            contents=f"{system_instruction}\n\nFaculty Administrative Request: {data.query}"
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))