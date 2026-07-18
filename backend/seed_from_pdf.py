import os
import re
import random
from pypdf import PdfReader
from database import SessionLocal, engine, Base
from models import Student, Course, Faculty, Grade, Attendance, MapNode

# Fixed path targeting the new Files subdirectory
pdf_path = r"C:\Users\ARYA SURESH\campusos-workspace\campusos-workspace\Files\S2 G 2025.pdf"

def parse_pdf():
    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        return []
        
    reader = PdfReader(pdf_path)
    students = []
    
    # Match: SlNo RollNo AdmnNo Name Gender
    # Example: 1. CL25G01 CHN25BT284 AABHA  R F
    pattern = re.compile(r"^(\d+)\.\s+(CL\w+)\s+(CHN\w+)\s+(.+)\s+([MF])$")
    
    for page in reader.pages:
        text = page.extract_text()
        for line in text.split("\n"):
            line = line.strip()
            match = pattern.match(line)
            if match:
                sl_no = match.group(1)
                roll = match.group(2)
                admn = match.group(3)
                name = match.group(4).strip()
                gender_code = match.group(5)
                
                gender = "Female" if gender_code == "F" else "Male"
                students.append({
                    "roll": roll,
                    "admn": admn,
                    "name": name,
                    "gender": gender
                })
    return students

def seed_db(students):
    # Drop and recreate all tables for absolute schema safety
    print("Recreating database tables for absolute schema alignment...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 2. Seed Faculty Advisor
        print("Seeding Faculty advisor...")
        advisor = Faculty(
            faculty_id="FAC204",
            name="Dr. Sarah D'Souza",
            email="sarah.dsouza@engg.cec.ac.in",
            department="Computer Science & Engineering",
            designation="Professor",
            office_location="Cabin 204",
            mobile="+91 9845230910"
        )
        db.add(advisor)
        db.commit()
        
        # 3. Seed Courses
        print("Seeding Course catalog...")
        courses = [
            Course(code="CS101", title="Structured Programming in C", credits=4, instructor="Dr. Sarah D'Souza"),
            Course(code="CS102", title="Introduction to Digital Electronics", credits=3, instructor="Prof. Ramesh Kumar")
        ]
        for c in courses:
            db.add(c)
        db.commit()
        
        # 4. Seed Students
        print(f"Seeding {len(students)} students from PDF list...")
        grades_pool = ["A+", "A", "B+", "B", "C", "D", "F"]
        comments_pool = [
            "Excellent performance and logical clarity.",
            "Solid coding skills, good coursework submission.",
            "Understands concepts well, needs more practice in syntax.",
            "Average performance, needs to focus on lab exams.",
            "Low marks. Needs immediate tutoring and attention.",
            "Excellent analytical skills.",
            "Needs to catch up on fundamentals."
        ]
        
        for s in students:
            attendance = round(random.uniform(62.0, 99.5), 1)
            gpa = f"{round(random.uniform(6.0, 9.8), 2)}"
            tuition = "Paid" if random.random() > 0.25 else "Unpaid"
            dues = 0.0 if tuition == "Paid" else round(random.uniform(500.0, 2500.0), 2)
            
            # Formatting clean email handles
            clean_name = re.sub(r'[^a-zA-Z]', '', s["name"].lower())
            email = f"{clean_name}@engg.cec.ac.in"
            
            # Hostel Allocation (Seeding 70% of students into hostels)
            hostel = ""
            room = ""
            warden = ""
            if random.random() > 0.3:
                hostel = "Sarayu Ladies Hostel" if s["gender"] == "Female" else "Pampa Mens Hostel"
                room = f"{random.randint(101, 312)}"
                warden = "Mrs. Mini Mathew" if s["gender"] == "Female" else "Mr. John Philip"
            
            db_student = Student(
                roll_number=s["roll"],
                name=s["name"].title(),
                gender=s["gender"],
                dob=f"2006-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                email=email,
                mobile=f"+91 9447{random.randint(100000, 999999)}",
                admission_number=s["admn"],
                department="Computer Science & Engineering",
                course="B.Tech Computer Science",
                semester="2",
                section="G",
                batch="2025-26",
                admission_date="2025-08-01",
                advisor="Dr. Sarah D'Souza",
                attendance_pct=attendance,
                tuition_status=tuition,
                pending_dues=dues,
                hostel_name=hostel,
                room_number=room,
                warden_name=warden,
                college_id=s["admn"],
                gpa_metrics=gpa,
                placement_status="Unplaced"
            )
            db.add(db_student)
            db.flush() # flush to get database session hooks working
            
            # 5. Log 1-2 academic grades per student
            log_grades_count = random.choice([1, 2])
            selected_courses = random.sample(courses, log_grades_count)
            for course in selected_courses:
                grade_letter = random.choice(grades_pool)
                # Ensure Fail grade matches low marks
                marks = round(random.uniform(85, 99), 1) if "A" in grade_letter else \
                        round(random.uniform(70, 84), 1) if "B" in grade_letter else \
                        round(random.uniform(50, 69), 1) if "C" in grade_letter or "D" in grade_letter else \
                        round(random.uniform(25, 45), 1)
                
                comment = random.choice(comments_pool)
                if grade_letter == "F":
                    comment = "Failing. Academic warning issued."
                
                db_grade = Grade(
                    student_roll=s["roll"],
                    course_code=course.code,
                    grade=grade_letter,
                    marks=marks,
                    comments=comment
                )
                db.add(db_grade)
                
            # Log 1-2 attendance log lines for this class
            db_att = Attendance(
                student_name=s["name"].title(),
                course_code="CS101",
                date=f"2026-07-{random.randint(10, 17):02d}",
                status="Present" if attendance > 75 or random.random() > 0.2 else "Absent"
            )
            db.add(db_att)

        # 6. Seed Map Nodes
        print("Seeding Map nodes...")
        map_nodes = [
            # Ground Floor
            MapNode(name="GF-01: Principal's Office", type="Cabin", location_details="Floor: Ground Floor, Dept: Administration, Notes: Includes executive desk and visitor anteroom"),
            MapNode(name="GF-02: Main Administrative Office", type="Building", location_details="Floor: Ground Floor, Dept: Administration, Notes: Clerical workstations, student counters, records vault"),
            MapNode(name="GF-03: Central Lobby / Main Hall", type="Building", location_details="Floor: Ground Floor, Dept: General, Notes: Primary open-layout student reception area"),
            MapNode(name="GF-04: Electrical Machines Lab", type="Lab", location_details="Floor: Ground Floor, Dept: EEE Department, Notes: Heavy machinery setups, testing benches, and dynamos"),
            MapNode(name="GF-05: Power Electronics Lab", type="Lab", location_details="Floor: Ground Floor, Dept: EEE Department, Notes: Circuits, diagnostic benches, and measurement units"),
            MapNode(name="GF-06: Faculty Room - EEE", type="Cabin", location_details="Floor: Ground Floor, Dept: EEE Department, Notes: Staff cubicles and departmental counseling area"),
            MapNode(name="GF-07: Co-operative Store", type="Building", location_details="Floor: Ground Floor, Dept: General, Notes: Stationery, lab manuals, drawing tools distribution"),
            
            # First Floor
            MapNode(name="FF-01: Central Library", type="Building", location_details="Floor: First Floor, Dept: General, Notes: Circulation counter, terminal indexes, reading areas"),
            MapNode(name="FF-02: Reference Section", type="Building", location_details="Floor: First Floor, Dept: General, Notes: Journal archives, specialized engineering volumes"),
            MapNode(name="FF-03: Electronic Circuits Lab", type="Lab", location_details="Floor: First Floor, Dept: ECE Department, Notes: Oscilloscopes, function generators, workbench matrix"),
            MapNode(name="FF-04: Communication Engineering Lab", type="Lab", location_details="Floor: First Floor, Dept: ECE Department, Notes: Signal processing kits, microcontrollers, antennas"),
            MapNode(name="FF-05: Faculty Room - ECE", type="Cabin", location_details="Floor: First Floor, Dept: ECE Department, Notes: Staff desks and department administration"),
            MapNode(name="FF-06: Smart Classroom S1", type="Classroom", location_details="Floor: First Floor, Dept: EEE / ECE, Notes: Multimedia lecture room with integrated projection"),
            MapNode(name="FF-07: Smart Classroom S2", type="Classroom", location_details="Floor: First Floor, Dept: EEE / ECE, Notes: Multimedia lecture room with integrated projection"),
            MapNode(name="FF-08: Smart Classroom S3", type="Classroom", location_details="Floor: First Floor, Dept: EEE / ECE, Notes: Multimedia lecture room with integrated projection"),
            MapNode(name="FF-09: Smart Classroom S4", type="Classroom", location_details="Floor: First Floor, Dept: EEE / ECE, Notes: Multimedia lecture room with integrated projection"),
            
            # Second Floor
            MapNode(name="SF-01: Central Computing Facility (CCF)", type="Lab", location_details="Floor: Second Floor, Dept: CSE Department, Notes: Main local server node, 60+ networked workstations"),
            MapNode(name="SF-02: Programming & Data Structures Lab", type="Lab", location_details="Floor: Second Floor, Dept: CSE Department, Notes: Linux environments, compilers, programming terminals"),
            MapNode(name="SF-03: Project & Research Lab", type="Lab", location_details="Floor: Second Floor, Dept: CSE / PRODDEC, Notes: Embedded development tools, prototype staging area"),
            MapNode(name="SF-04: Faculty Room - CSE", type="Cabin", location_details="Floor: Second Floor, Dept: CSE Department, Notes: Staff workstations and student project guidance hubs"),
            MapNode(name="SF-05: Main Seminar Hall", type="Building", location_details="Floor: Second Floor, Dept: General, Notes: Audio-visual theater for tech events & placement runs"),
            MapNode(name="SF-06: Smart Classroom S5", type="Classroom", location_details="Floor: Second Floor, Dept: CSE / General, Notes: Advanced lecture environment for senior branches"),
            MapNode(name="SF-07: Smart Classroom S6", type="Classroom", location_details="Floor: Second Floor, Dept: CSE / General, Notes: Advanced lecture environment for senior branches"),
            MapNode(name="SF-08: Smart Classroom S7", type="Classroom", location_details="Floor: Second Floor, Dept: CSE / General, Notes: Advanced lecture environment for senior branches"),
            MapNode(name="SF-09: Smart Classroom S8", type="Classroom", location_details="Floor: Second Floor, Dept: CSE / General, Notes: Advanced lecture environment for senior branches"),
            
            # Third Floor (Generated)
            MapNode(name="TF-01: Advanced Network & Cloud Computing Lab", type="Lab", location_details="Floor: Third Floor, Dept: CSE / IT Department, Notes: High-performance routing racks, cloud clusters, virtualization sandboxes"),
            MapNode(name="TF-02: Software Engineering Studio", type="Lab", location_details="Floor: Third Floor, Dept: CSE / IT Department, Notes: Agile collaborative workspaces, agile sprints boards, review screens"),
            MapNode(name="TF-03: Internet of Things (IoT) Lab", type="Lab", location_details="Floor: Third Floor, Dept: CSE / IT Department, Notes: Microcontrollers, sensors, soldering stations, embedded device debugging"),
            MapNode(name="TF-04: Faculty Room - IT", type="Cabin", location_details="Floor: Third Floor, Dept: IT Department, Notes: IT faculty desks, student counseling workspaces"),
            MapNode(name="TF-05: IT Department Head Office", type="Cabin", location_details="Floor: Third Floor, Dept: IT Department, Notes: Department head desk, conference space for curriculum planning"),
            MapNode(name="TF-06: Smart Classroom S9", type="Classroom", location_details="Floor: Third Floor, Dept: CSE / IT, Notes: Multimedia senior lecture room, digital whiteboard setup"),
            MapNode(name="TF-07: Smart Classroom S10", type="Classroom", location_details="Floor: Third Floor, Dept: CSE / IT, Notes: Multimedia senior lecture room, digital whiteboard setup"),
            
            # Fourth Floor (Generated)
            MapNode(name="4F-01: Robotics & Artificial Intelligence Lab", type="Lab", location_details="Floor: Fourth Floor, Dept: Research & CSE, Notes: Robotic arms, GPU deep learning server node, computer vision cameras"),
            MapNode(name="4F-02: VLSI & Microelectronics Research Lab", type="Lab", location_details="Floor: Fourth Floor, Dept: Research & ECE, Notes: FPGA design kits, logic analyzers, chip design emulation terminals"),
            MapNode(name="4F-03: Research & Incubation Hub", type="Building", location_details="Floor: Fourth Floor, Dept: General, Notes: Startup incubation desks, patent drafting cell, high-speed fiber connection"),
            MapNode(name="4F-04: Faculty Room - Post Graduates", type="Cabin", location_details="Floor: Fourth Floor, Dept: Applied Sciences, Notes: Workstations for research fellows, PG guides, PhD mentors"),
            MapNode(name="4F-05: Smart Auditing Hall", type="Building", location_details="Floor: Fourth Floor, Dept: General, Notes: Micro-lecture recording studio, peer review classroom"),
            MapNode(name="4F-06: Smart Classroom S11", type="Classroom", location_details="Floor: Fourth Floor, Dept: General, Notes: Multi-purpose PG classroom with hybrid lecture cameras"),
            MapNode(name="4F-07: Smart Classroom S12", type="Classroom", location_details="Floor: Fourth Floor, Dept: General, Notes: Multi-purpose PG classroom with hybrid lecture cameras"),
        ]
        for m in map_nodes:
            db.add(m)
        db.commit()

        db.commit()
        print("Database successfully seeded with academic, faculty, student, and map registries!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parsed_students = parse_pdf()
    print(f"Successfully parsed {len(parsed_students)} students from PDF file.")
    if parsed_students:
        seed_db(parsed_students)
