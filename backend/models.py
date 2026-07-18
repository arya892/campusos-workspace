from sqlalchemy import Column, Integer, String, Float
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    # Personal & Demographics
    roll_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    gender = Column(String)
    dob = Column(String)
    blood_group = Column(String)
    photo_url = Column(String)
    
    # Contact Matrix
    mobile = Column(String)
    email = Column(String, unique=True, index=True)
    perm_address = Column(String)
    current_address = Column(String)
    parent_name = Column(String)
    parent_contact = Column(String)
    
    # Academic & Curriculum Details
    admission_number = Column(String, unique=True)
    department = Column(String)
    course = Column(String)
    semester = Column(String)
    section = Column(String)
    batch = Column(String)
    admission_date = Column(String)
    advisor = Column(String)
    
    # Secure Identifiers
    aadhaar_vault = Column(String) 
    passport_number = Column(String)
    college_id = Column(String)
    
    # Housing & Living Logistics
    hostel_name = Column(String)
    room_number = Column(String)
    warden_name = Column(String)
    hostel_checkin = Column(String)
    
    # Transit Profiles
    bus_route = Column(String)
    boarding_point = Column(String)
    bus_pass_number = Column(String)
    
    # Performance & Attendance Analytics
    attendance_pct = Column(Float, default=100.0)
    leave_records = Column(String)
    internal_marks = Column(String)
    gpa_metrics = Column(String)
    backlogs = Column(Integer, default=0)
    
    # Bursar & Financial Details
    tuition_status = Column(String)
    scholarship_details = Column(String)
    pending_dues = Column(Float, default=0.0)
    
    # Library Assets Tracking
    library_card = Column(String)
    books_issued = Column(String)
    library_fine = Column(Float, default=0.0)
    
    # Health Registry
    medical_conditions = Column(String)
    emergency_contact = Column(String)
    allergies = Column(String)
    
    # Extracurricular & Co-Curricular Profiles
    clubs = Column(String)
    sports = Column(String)
    responsibilities = Column(String)
    achievements = Column(String)
    
    # Career Advancement & Placement Statistics
    resume_status = Column(String)
    internship_details = Column(String)
    placement_status = Column(String)
    company_placed = Column(String)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    credits = Column(Integer, default=3)
    instructor = Column(String, nullable=False)

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    course_code = Column(String, nullable=False)
    date = Column(String, nullable=False)
    status = Column(String, nullable=False)

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    category = Column(String, nullable=False)

class MapNode(Base):
    __tablename__ = "map_nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    location_details = Column(String, nullable=False)

class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    cpu_load = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    network_latency = Column(String, default="0ms")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String)
    designation = Column(String)
    office_location = Column(String)
    mobile = Column(String)

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_roll = Column(String, nullable=False)
    course_code = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    marks = Column(Float, default=0.0)
    comments = Column(String)