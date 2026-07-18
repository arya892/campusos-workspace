import { useState, useEffect } from 'react'
import axios from 'axios'

interface Student {
  id: number; name: string; roll_number: string; gender: string; dob: string; blood_group: string; photo_url: string;
  mobile: string; email: string; perm_address: string; current_address: string; parent_name: string; parent_contact: string;
  admission_number: string; department: string; course: string; semester: string; section: string; batch: string;
  admission_date: string; advisor: string; passport_number: string; college_id: string; hostel_name: string;
  room_number: string; warden_name: string; hostel_checkin: string; bus_route: string; boarding_point: string;
  bus_pass_number: string; attendance_pct: number; leave_records: string; internal_marks: string; gpa_metrics: string;
  backlogs: number; tuition_status: string; scholarship_details: string; pending_dues: number; library_card: string;
  books_issued: string; library_fine: number; medical_conditions: string; emergency_contact: string; allergies: string;
  clubs: string; sports: string; responsibilities: string; achievements: string; resume_status: string;
  internship_details: string; placement_status: string; company_placed: string;
}

interface Course { id: number; code: string; title: string; credits: number; instructor: string; }
interface Attendance { id: number; student_name: string; course_code: string; date: string; status: string; }
interface Notice { id: number; title: string; content: string; category: string; }
interface MapNode { id: number; name: string; type: string; location_details: string; }
interface Telemetry { cpu_load: number; memory_usage: number; network_latency: string; }

interface Faculty {
  id: number;
  faculty_id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  office_location: string;
  mobile: string;
}

interface Grade {
  id: number;
  student_roll: string;
  course_code: string;
  grade: string;
  marks: number;
  comments: string;
}

interface BlueprintRoom {
  code: string;
  name: string;
  dept: string;
  desc: string;
  gridArea: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'grades' | 'faculty' | 'attendance' | 'notices' | 'map' | 'system'>('students')
  const [backendStatus, setBackendStatus] = useState<string>("CALIBRATING...")
  const [telemetry, setTelemetry] = useState<Telemetry>({ cpu_load: 0, memory_usage: 0, network_latency: "0ms" })
  
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [mapNodes, setMapNodes] = useState<MapNode[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  // Comprehensive Student Form State
  const [form, setForm] = useState({
    roll_number: "", name: "", gender: "Male", dob: "", blood_group: "", photo_url: "",
    mobile: "", email: "", perm_address: "", current_address: "", parent_name: "", parent_contact: "",
    admission_number: "", department: "", course: "", semester: "1", section: "A", batch: "",
    admission_date: "", advisor: "", aadhaar_input: "", passport_number: "", college_id: "",
    hostel_name: "", room_number: "", warden_name: "", hostel_checkin: "", bus_route: "",
    boarding_point: "", bus_pass_number: "", attendance_pct: 100, leave_records: "",
    internal_marks: "", gpa_metrics: "", backlogs: 0, tuition_status: "Unpaid",
    scholarship_details: "", pending_dues: 0, library_card: "", books_issued: "",
    library_fine: 0, medical_conditions: "", emergency_contact: "", allergies: "",
    clubs: "", sports: "", responsibilities: "", achievements: "", resume_status: "Not Submitted",
    internship_details: "", placement_status: "Unplaced", company_placed: ""
  })
  const [studentMessage, setStudentMessage] = useState("")

  // Course Form State
  const [courseCode, setCourseCode] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [courseInstructor, setCourseInstructor] = useState("")
  const [courseMessage, setCourseMessage] = useState("")

  // Attendance Form State
  const [attName, setAttName] = useState("")
  const [attCode, setAttCode] = useState("")
  const [attDate, setAttDate] = useState("")
  const [attStatus, setAttStatus] = useState("Present")
  const [attMessage, setAttMessage] = useState("")

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState("")
  const [noticeContent, setNoticeContent] = useState("")
  const [noticeCategory, setNoticeCategory] = useState("Academic")
  const [noticeMessage, setNoticeMessage] = useState("")

  // Map Node Form State
  const [nodeName, setNodeName] = useState("")
  const [nodeType, setNodeType] = useState("Building")
  const [nodeDetails, setNodeDetails] = useState("")
  const [nodeMessage, setNodeMessage] = useState("")

  // Faculty Form State
  const [facId, setFacId] = useState("")
  const [facName, setFacName] = useState("")
  const [facEmail, setFacEmail] = useState("")
  const [facDept, setFacDept] = useState("")
  const [facDesig, setFacDesig] = useState("Assistant Professor")
  const [facOffice, setFacOffice] = useState("")
  const [facMobile, setFacMobile] = useState("")
  const [facMessage, setFacMessage] = useState("")

  // Grade Form State
  const [grdRoll, setGrdRoll] = useState("")
  const [grdCode, setGrdCode] = useState("")
  const [grdGrade, setGrdGrade] = useState("A")
  const [grdMarks, setGrdMarks] = useState(0)
  const [grdComments, setGrdComments] = useState("")
  const [grdMessage, setGrdMessage] = useState("")

  // Interactive 2D Map Blueprint States
  const [selectedFloor, setSelectedFloor] = useState<'GF' | 'FF' | 'SF' | 'TF' | '4F'>('GF')
  const [selectedRoom, setSelectedRoom] = useState<BlueprintRoom | null>(null)

  // AI Mainframe states
  const [inputQuery, setInputQuery] = useState("")
  const [aiResponse, setAiResponse] = useState("Academic Advisor Oracle is active. Ask anything about grade patterns, advisories, attendance distributions, or student summaries...")
  const [aiInsights, setAiInsights] = useState("Click the button above to run a multi-variate analytical audit on database student performance records.")
  const [isLoading, setIsLoading] = useState(false)
  const [isInsightLoading, setIsInsightLoading] = useState(false)

  // Spatial Floor Blueprint configuration matrices
  const floorBlueprints: Record<'GF' | 'FF' | 'SF' | 'TF' | '4F', BlueprintRoom[]> = {
    GF: [
      { code: "GF-04", name: "Electrical Machines Lab", dept: "EEE Dept", desc: "Heavy machinery setups, testing dynamos and testing benches", gridArea: "col-span-2 row-span-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800" },
      { code: "GF-05", name: "Power Electronics Lab", dept: "EEE Dept", desc: "Circuits development and diagnostic measurements benches", gridArea: "col-span-1 row-span-1 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800" },
      { code: "GF-06", name: "Faculty Room - EEE", dept: "EEE Dept", desc: "EEE staff workstations and departmental counseling desks", gridArea: "col-span-1 row-span-1 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800" },
      { code: "GF-03", name: "Central Lobby & Porch", dept: "General", desc: "Main student entry lobby, open layout reception, porch access", gridArea: "col-span-2 row-span-2 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800 flex flex-col justify-center items-center" },
      { code: "GF-01", name: "Principal's Office", dept: "Admin", desc: "Principal executive chamber, conference desk and guest anteroom", gridArea: "col-span-1 row-span-1 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800" },
      { code: "GF-02", name: "Main Administrative Office", dept: "Admin", desc: "Administrative clerical counters, record vault and office desks", gridArea: "col-span-1 row-span-2 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800" },
      { code: "GF-07", name: "Co-operative Store", dept: "General", desc: "Drawing toolsets, academic manuals and college stationery distribution", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" }
    ],
    FF: [
      { code: "FF-03", name: "Electronic Circuits Lab", dept: "ECE Dept", desc: "Workbenches setup, digital design modules and diagnostic tools", gridArea: "col-span-2 row-span-1 bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-800" },
      { code: "FF-04", name: "Communication Eng. Lab", dept: "ECE Dept", desc: "Signal processing setups, RF kits and microcontrollers", gridArea: "col-span-1 row-span-1 bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-800" },
      { code: "FF-05", name: "Faculty Room - ECE", dept: "ECE Dept", desc: "ECE professor staff cabins and departmental counseling area", gridArea: "col-span-1 row-span-1 bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-800" },
      { code: "FF-01", name: "Central Library", dept: "General", desc: "Main library hall, index catalogs, terminal search, checkout desk", gridArea: "col-span-2 row-span-2 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800 flex flex-col justify-center items-center" },
      { code: "FF-02", name: "Reference Reading Room", dept: "General", desc: "National journals index archives and quiet reading space", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "FF-06", name: "Smart Classroom S1", dept: "EEE/ECE", desc: "Senior class multi-media classroom, AV projector mapping", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "FF-07", name: "Smart Classroom S2", dept: "EEE/ECE", desc: "Senior class multi-media classroom, AV projector mapping", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "FF-08", name: "Smart Classroom S3", dept: "EEE/ECE", desc: "Senior class multi-media classroom, AV projector mapping", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" }
    ],
    SF: [
      { code: "SF-01", name: "Central Computing Facility (CCF)", dept: "CSE Dept", desc: "60+ Ubuntu terminals, primary college server and intranet racks", gridArea: "col-span-2 row-span-2 bg-indigo-100 hover:bg-indigo-150 border-indigo-300 text-indigo-900 font-bold flex flex-col justify-center items-center" },
      { code: "SF-02", name: "Programming & Data Structs Lab", dept: "CSE Dept", desc: "Programming lab, software engineering and compilation terminals", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "SF-03", name: "Project & Research Lab", dept: "CSE / PRODDEC", desc: "IoT kits, software prototype testing and innovation hub", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "SF-04", name: "Faculty Room - CSE", dept: "CSE Dept", desc: "CSE staff cabins, advisor desks and student project reviews", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "SF-05", name: "Main Seminar Hall", dept: "General", desc: "Main audio-visual theater, placement interviews and seminar runs", gridArea: "col-span-2 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "SF-06", name: "Smart Classroom S5", dept: "CSE Dept", desc: "Senior B.Tech CSE smart lecture room, dual presentation screens", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "SF-07", name: "Smart Classroom S6", dept: "CSE Dept", desc: "Senior B.Tech CSE smart lecture room, dual presentation screens", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" }
    ],
    TF: [
      { code: "TF-01", name: "Cloud Computing & Networks Lab", dept: "CSE / IT", desc: "Cloud clustering setups, high-performance routing virtualization", gridArea: "col-span-2 row-span-2 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800 flex flex-col justify-center items-center" },
      { code: "TF-02", name: "Software Engineering Studio", dept: "CSE / IT", desc: "Collaborative software design setups and scrum team spaces", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "TF-03", name: "IoT & Embedded Systems Lab", dept: "CSE / IT", desc: "Arduino and Raspberry Pi development, diagnostic sensor grids", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "TF-04", name: "Faculty Room - IT", dept: "IT Dept", desc: "IT staff cabins and student guidance hubs", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "TF-05", name: "IT HOD Office", dept: "IT Dept", desc: "IT Department Head chambers and curriculum panel workspace", gridArea: "col-span-1 row-span-1 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800" },
      { code: "TF-06", name: "Smart Classroom S9", dept: "IT / CSE", desc: "Senior multi-media classroom, lecture capturing system", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "TF-07", name: "Smart Classroom S10", dept: "IT / CSE", desc: "Senior multi-media classroom, lecture capturing system", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" }
    ],
    "4F": [
      { code: "4F-01", name: "Robotics & Artificial Intelligence Lab", dept: "Research", desc: "Industrial robotic manipulators, CUDA servers, deep learning terminals", gridArea: "col-span-2 row-span-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800 font-bold flex flex-col justify-center items-center" },
      { code: "4F-02", name: "VLSI & Microelectronics Research Lab", dept: "Research", desc: "FPGA boards development, logic analyzers, chip emulation tools", gridArea: "col-span-1 row-span-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800" },
      { code: "4F-03", name: "Research & Incubation Hub", dept: "Research", desc: "Student startup workspace, intellectual property assistance cells", gridArea: "col-span-1 row-span-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800" },
      { code: "4F-04", name: "Faculty Room - Post Graduates", dept: "Applied Sci", desc: "Cabins for PG advisors, PhD guides and post-doctoral mentors", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "4F-05", name: "Smart Auditing Hall", dept: "General", desc: "Micro-lecture and recording theater, automated panel projection", gridArea: "col-span-2 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "4F-06", name: "Smart Classroom S11", dept: "General", desc: "PG branches hybrid smart lecture room with zoom capability", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" },
      { code: "4F-07", name: "Smart Classroom S12", dept: "General", desc: "PG branches hybrid smart lecture room with zoom capability", gridArea: "col-span-1 row-span-1 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800" }
    ]
  }

  useEffect(() => {
    fetchSystemStatus();
    refreshDataPool();
    const metricsTimer = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(metricsTimer);
  }, [])

  const fetchSystemStatus = () => {
    axios.get('https://dashboard.render.com/')
      .then((res) => setBackendStatus(res.data.status.toUpperCase()))
      .catch(() => setBackendStatus("OFFLINE"))
  }

  const fetchTelemetry = () => {
    axios.get('https://dashboard.render.com/api/v1/system/metrics')
      .then((res) => setTelemetry(res.data))
      .catch(() => setTelemetry({ cpu_load: 0, memory_usage: 0, network_latency: "ERR" }))
  }

  const refreshDataPool = async () => {
    try {
      const studentRes = await axios.get('https://dashboard.render.com/api/v1/students')
      setStudents(studentRes.data)
      const courseRes = await axios.get('https://dashboard.render.com/api/v1/courses')
      setCourses(courseRes.data)
      const attRes = await axios.get('https://dashboard.render.com/api/v1/attendance')
      setAttendance(attRes.data)
      const noticeRes = await axios.get('https://dashboard.render.com//api/v1/notices')
      setNotices(noticeRes.data)
      const nodeRes = await axios.get('https://dashboard.render.com//api/v1/map-nodes')
      setMapNodes(nodeRes.data)
      const facRes = await axios.get('https://dashboard.render.com//api/v1/faculty')
      setFaculty(facRes.data)
      const gradeRes = await axios.get('https://dashboard.render.com//api/v1/grades')
      setGrades(gradeRes.data)
    } catch (err) { console.error("Data refresh pipeline error: ", err) }
  }

  const handleFormChange = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.roll_number || !form.course) {
      setStudentMessage("⚠️ Incomplete Request: Required identity coordinates missing.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/students', form)
      setStudentMessage("⚡ Student registered successfully inside administrative registry.")
      setForm({
        roll_number: "", name: "", gender: "Male", dob: "", blood_group: "", photo_url: "",
        mobile: "", email: "", perm_address: "", current_address: "", parent_name: "", parent_contact: "",
        admission_number: "", department: "", course: "", semester: "1", section: "A", batch: "",
        admission_date: "", advisor: "", aadhaar_input: "", passport_number: "", college_id: "",
        hostel_name: "", room_number: "", warden_name: "", hostel_checkin: "", bus_route: "",
        boarding_point: "", bus_pass_number: "", attendance_pct: 100, leave_records: "",
        internal_marks: "", gpa_metrics: "", backlogs: 0, tuition_status: "Unpaid",
        scholarship_details: "", pending_dues: 0, library_card: "", books_issued: "",
        library_fine: 0, medical_conditions: "", emergency_contact: "", allergies: "",
        clubs: "", sports: "", responsibilities: "", achievements: "", resume_status: "Not Submitted",
        internship_details: "", placement_status: "Unplaced", company_placed: ""
      })
      refreshDataPool();
    } catch { setStudentMessage("⚠️ Transaction Denied: Data format collision.") }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseCode || !courseTitle || !courseInstructor) {
      setCourseMessage("⚠️ Please fill in all required catalog metrics.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/courses', { code: courseCode, title: courseTitle, credits: 3, instructor: courseInstructor })
      setCourseMessage("⚡ Course catalogue block updated successfully.")
      setCourseCode(""); setCourseTitle(""); setCourseInstructor("");
      refreshDataPool();
    } catch { setCourseMessage("⚠️ Compilation Denied: Schema conflict.") }
  }

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attName || !attCode || !attDate) {
      setAttMessage("⚠️ Student Name, Course, and Date are required.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/attendance', { student_name: attName, course_code: attCode, date: attDate, status: attStatus })
      setAttMessage("⚡ Class timeline log recorded.")
      setAttName(""); setAttCode(""); setAttDate("");
      refreshDataPool();
    } catch { setAttMessage("⚠️ Logging failure: Unable to bind attendance node.") }
  }

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noticeTitle || !noticeContent) {
      setNoticeMessage("⚠️ Notice title and body content required.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/notices', { title: noticeTitle, content: noticeContent, category: noticeCategory })
      setNoticeMessage("⚡ Announcement dispatched to notice board.")
      setNoticeTitle(""); setNoticeContent("");
      refreshDataPool();
    } catch { setNoticeMessage("⚠️ Broadcast failure: Notice pipeline interrupted.") }
  }

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nodeName || !nodeDetails) {
      setNodeMessage("⚠️ Location Name and navigation details are required.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/map-nodes', { name: nodeName, type: nodeType, location_details: nodeDetails })
      setNodeMessage("⚡ Geospatial facility target mapped.")
      setNodeName(""); setNodeDetails("");
      refreshDataPool();
    } catch { setNodeMessage("⚠️ Map plot rejected: Vector out of bounds.") }
  }

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facId || !facName || !facEmail) {
      setFacMessage("⚠️ Faculty ID, Name, and Email net node are required.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/faculty', {
        faculty_id: facId, name: facName, email: facEmail,
        department: facDept, designation: facDesig,
        office_location: facOffice, mobile: facMobile
      })
      setFacMessage("⚡ Faculty record registered in university database.")
      setFacId(""); setFacName(""); setFacEmail(""); setFacDept(""); setFacOffice(""); setFacMobile("");
      refreshDataPool()
    } catch { setFacMessage("⚠️ Database write fault: Faculty record collision.") }
  }

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grdRoll || !grdCode || !grdGrade) {
      setGrdMessage("⚠️ Student Roll, Course Code, and Grade Letter are required.")
      return
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/v1/grades', {
        student_roll: grdRoll, course_code: grdCode, grade: grdGrade,
        marks: Number(grdMarks), comments: grdComments
      })
      setGrdMessage("⚡ Student academic grade cataloged.")
      setGrdRoll(""); setGrdCode(""); setGrdMarks(0); setGrdComments("");
      refreshDataPool()
    } catch { setGrdMessage("⚠️ Write fault: Student record link unreachable.") }
  }

  const triggerGlobalAudit = async () => {
    setIsInsightLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/ai/query', {
        query: "Provide a detailed academic audit of active enrollments. Highlight students with low attendance (below 75%), outstanding tuition status, average GPA metrics, grade distribution, and placement conversions."
      })
      setAiInsights(res.data.response)
    } catch { setAiInsights("⚠️ AI Inter-link down: Unable to compile performance matrices.") }
    finally { setIsInsightLoading(false) }
  }

  const handleAskGemma = async (e: React.FormEvent) => {
    e.preventDefault(); if (!inputQuery.trim()) return
    setIsLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/ai/query', { query: inputQuery })
      setAiResponse(res.data.response)
    } catch { setAiResponse("⚠️ Connection Refused: Academic Mainframe API dropped the package.") }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 lg:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900 font-medium">
      
      {/* Decorative Professional Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Academic Header Banner */}
        <header className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 bg-indigo-600 rounded-sm"></span>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                CAMPUS_OS // FACULTY HUB
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase mt-1 tracking-wider">Academic Administration & Analytics Dashboard</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Live Operational Metrics Readout */}
            <div className="flex gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 w-full sm:w-auto justify-around sm:justify-start">
              <div>CPU: <span className="text-indigo-600 font-semibold">{telemetry.cpu_load}%</span></div>
              <div className="w-[1px] bg-slate-200 h-3 self-center"></div>
              <div>RAM: <span className="text-indigo-600 font-semibold">{telemetry.memory_usage}%</span></div>
              <div className="w-[1px] bg-slate-200 h-3 self-center"></div>
              <div>PING: <span className="text-indigo-600 font-semibold">{telemetry.network_latency}</span></div>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border w-full sm:w-auto justify-center text-xs font-semibold ${
              backendStatus === "ONLINE"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              <span className={`h-2 w-2 rounded-full ${backendStatus === "ONLINE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span>API STATUS: {backendStatus}</span>
            </div>
          </div>
        </header>

        {/* Tab Selection Navigation */}
        <nav className="bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 flex flex-wrap gap-1 shadow-inner overflow-x-auto">
          {(['students', 'courses', 'grades', 'faculty', 'attendance', 'notices', 'map', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-indigo-700 border border-slate-200 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Dynamic Splits Dashboard Engine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Action Module Containers (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'students' && (
              <div className="space-y-6">
                {/* Advanced Student Ingestion Form */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Student Registration Console
                  </h2>
                  
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    {/* Category Block 1: Core Personal Metrics */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1">01. Core Identity Vectors</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="text" value={form.roll_number} onChange={(e) => handleFormChange('roll_number', e.target.value)} placeholder="ROLL_NUMBER *" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="FULL_NAME *" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="EMAIL_NET_NODE *" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select value={form.gender} onChange={(e) => handleFormChange('gender', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-705">
                          <option value="Male">MALE</option><option value="Female">FEMALE</option><option value="Other">OTHER</option>
                        </select>
                        <input type="text" value={form.dob} onChange={(e) => handleFormChange('dob', e.target.value)} placeholder="DOB (YYYY-MM-DD)" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.blood_group} onChange={(e) => handleFormChange('blood_group', e.target.value)} placeholder="BLOOD_GROUP" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.photo_url} onChange={(e) => handleFormChange('photo_url', e.target.value)} placeholder="PHOTO_IMAGE_URL" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      </div>
                    </div>

                    {/* Category Block 2: Academic Program Coordinates */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1">02. Academic Track Metrics</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="text" value={form.course} onChange={(e) => handleFormChange('course', e.target.value)} placeholder="COURSE (e.g., B.Tech AI) *" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.department} onChange={(e) => handleFormChange('department', e.target.value)} placeholder="DEPARTMENT" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.admission_number} onChange={(e) => handleFormChange('admission_number', e.target.value)} placeholder="ADMISSION_NUMBER" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="text" value={form.semester} onChange={(e) => handleFormChange('semester', e.target.value)} placeholder="SEMESTER" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.section} onChange={(e) => handleFormChange('section', e.target.value)} placeholder="SECTION" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.batch} onChange={(e) => handleFormChange('batch', e.target.value)} placeholder="BATCH_YEAR" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.advisor} onChange={(e) => handleFormChange('advisor', e.target.value)} placeholder="ACADEMIC_ADVISOR" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      </div>
                    </div>

                    {/* Category Block 3: Verification & Security Parameters */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1">03. Secure Verification Identifiers</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="password" value={form.aadhaar_input} onChange={(e) => handleFormChange('aadhaar_input', e.target.value)} placeholder="AADHAAR_NUMBER" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.passport_number} onChange={(e) => handleFormChange('passport_number', e.target.value)} placeholder="PASSPORT_NUMBER" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.college_id} onChange={(e) => handleFormChange('college_id', e.target.value)} placeholder="COLLEGE_ID_NUMBER" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      </div>
                    </div>

                    {/* Category Block 4: Logistics, Finance, Medical, Placement Blocks */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-1">04. Logistics, Finance, Medical & Careers</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="text" value={form.hostel_name} onChange={(e) => handleFormChange('hostel_name', e.target.value)} placeholder="HOSTEL_NAME" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.room_number} onChange={(e) => handleFormChange('room_number', e.target.value)} placeholder="ROOM_NO" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.bus_route} onChange={(e) => handleFormChange('bus_route', e.target.value)} placeholder="BUS_ROUTE_NO" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <select value={form.tuition_status} onChange={(e) => handleFormChange('tuition_status', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700">
                          <option value="Paid">TUITION_PAID</option><option value="Unpaid">TUITION_UNPAID</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input type="number" value={form.attendance_pct} onChange={(e) => handleFormChange('attendance_pct', Number(e.target.value))} placeholder="ATTENDANCE_%" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <input type="text" value={form.gpa_metrics} placeholder="GPA_CGPA_METRIC" onChange={(e) => handleFormChange('gpa_metrics', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                        <select value={form.placement_status} onChange={(e) => handleFormChange('placement_status', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700">
                          <option value="Unplaced">UNPLACED</option><option value="Placed">PLACED_CONFIRMED</option>
                        </select>
                        <input type="text" value={form.company_placed} onChange={(e) => handleFormChange('company_placed', e.target.value)} placeholder="COMPANY_NAME" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-sm tracking-wider">
                      SUBMIT NEW STUDENT ENTRY
                    </button>
                  </form>
                  {studentMessage && <p className="text-xs text-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-indigo-700 font-semibold">{studentMessage}</p>}
                </div>

                {/* Real-time Student Database Ledger */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase">// Active Student Roster</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {students.length === 0 ? <p className="text-xs text-slate-500 italic text-center py-6">Database currently empty. Enter student records above.</p> : 
                      students.map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-300 shadow-sm text-xs transition-all space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{s.name} <span className="text-slate-400 text-xs font-normal">({s.roll_number})</span></p>
                              <p className="text-slate-500 text-[11px] mt-0.5">{s.email} | Major: <span className="text-indigo-600 font-semibold">{s.course}</span></p>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md font-semibold text-[10px]">Sem {s.semester}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                            <div>GPA: <span className="text-slate-900 font-semibold">{s.gpa_metrics || "N/A"}</span></div>
                            <div>Attendance: <span className="text-slate-900 font-semibold">{s.attendance_pct}%</span></div>
                            <div>Hostel: <span className="text-slate-900 font-semibold">{s.hostel_name || "None"}</span></div>
                            <div>Placements: <span className={`font-semibold ${s.placement_status === 'Placed' ? 'text-emerald-600' : 'text-slate-600'}`}>{s.placement_status}</span></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Academic Course Registry
                  </h2>
                  <form onSubmit={handleAddCourse} className="space-y-3">
                    <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="CATALOG_CODE *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="COURSE_TITLE_STRING *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="text" value={courseInstructor} onChange={(e) => setCourseInstructor(e.target.value)} placeholder="LEAD_FACULTY_IDENTIFIER *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm">REGISTER COURSE SCHEMATIC</button>
                  </form>
                  {courseMessage && <p className="text-xs text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-indigo-700">{courseMessage}</p>}
                </div>

                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">// Active Course Catalog</h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 flex-1">
                    {courses.map(c => (
                      <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between items-center hover:border-indigo-200 transition-all shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800">{c.title}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">Instructor: {c.instructor}</p>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg font-bold text-[10px]">{c.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Grade Recorder Console
                  </h2>
                  <form onSubmit={handleAddGrade} className="space-y-3">
                    <input type="text" value={grdRoll} onChange={(e) => setGrdRoll(e.target.value)} placeholder="STUDENT_ROLL_NUMBER *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="text" value={grdCode} onChange={(e) => setGrdCode(e.target.value)} placeholder="COURSE_CODE *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={grdGrade} onChange={(e) => setGrdGrade(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-700">
                        <option value="A+">A+</option><option value="A">A</option><option value="B+">B+</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                      </select>
                      <input type="number" value={grdMarks} onChange={(e) => setGrdMarks(Number(e.target.value))} placeholder="MARKS *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    </div>
                    <input type="text" value={grdComments} onChange={(e) => setGrdComments(e.target.value)} placeholder="ACADEMIC_REMARKS" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm">COMMIT STUDENT GRADE</button>
                  </form>
                  {grdMessage && <p className="text-xs text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-indigo-700">{grdMessage}</p>}
                </div>

                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">// Cataloged Grade Register</h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 flex-1">
                    {grades.length === 0 ? <p className="text-xs text-slate-500 italic text-center py-6">No grades cataloged yet.</p> :
                      grades.map(g => (
                        <div key={g.id} className="bg-white p-3 rounded-xl border border-slate-100 text-xs flex justify-between items-center hover:border-indigo-200 transition-all shadow-sm">
                          <div>
                            <p className="font-bold text-slate-800">Roll: {g.student_roll}</p>
                            <p className="text-slate-500 text-[10px] mt-0.5">Course: {g.course_code} | {g.comments || "No comments"}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold text-[10px] mr-2">{g.grade}</span>
                            <span className="text-slate-600 text-[11px] font-semibold">{g.marks} marks</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Faculty Registration Portal
                  </h2>
                  <form onSubmit={handleAddFaculty} className="space-y-3">
                    <input type="text" value={facId} onChange={(e) => setFacId(e.target.value)} placeholder="FACULTY_ID_NUMBER *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="text" value={facName} onChange={(e) => setFacName(e.target.value)} placeholder="FULL_NAME *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="text" value={facEmail} onChange={(e) => setFacEmail(e.target.value)} placeholder="EMAIL_NET_NODE *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={facDept} onChange={(e) => setFacDept(e.target.value)} placeholder="DEPARTMENT" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      <select value={facDesig} onChange={(e) => setFacDesig(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-700">
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={facOffice} onChange={(e) => setFacOffice(e.target.value)} placeholder="OFFICE_CABIN" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      <input type="text" value={facMobile} onChange={(e) => setFacMobile(e.target.value)} placeholder="MOBILE_NUMBER" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm">ENROLL FACULTY MEMBER</button>
                  </form>
                  {facMessage && <p className="text-xs text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-indigo-700">{facMessage}</p>}
                </div>

                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">// Registered Faculty Directory</h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 flex-1">
                    {faculty.length === 0 ? <p className="text-xs text-slate-500 italic text-center py-6">Faculty directory currently empty.</p> :
                      faculty.map(f => (
                        <div key={f.id} className="bg-white p-3 rounded-xl border border-slate-100 text-xs hover:border-indigo-200 transition-all shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-800">{f.name}</p>
                              <p className="text-slate-500 text-[10px] mt-0.5">{f.designation} | Dept: {f.department}</p>
                              <p className="text-slate-400 text-[9px]">Email: {f.email} | Office: {f.office_location || "N/A"}</p>
                            </div>
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold text-[9px]">{f.faculty_id}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Attendance Registry Console
                  </h2>
                  <form onSubmit={handleLogAttendance} className="space-y-3">
                    <input type="text" value={attName} onChange={(e) => setAttName(e.target.value)} placeholder="STUDENT_NAME *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="text" value={attCode} onChange={(e) => setAttCode(e.target.value)} placeholder="TARGET_COURSE_CODE *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-600" />
                    <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-700">
                      <option value="Present">PRESENT_CONFIRMED</option><option value="Absent">ABSENT_DISPATCH</option>
                    </select>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm">COMMIT ATTENDANCE MARK</button>
                  </form>
                  {attMessage && <p className="text-xs text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-indigo-700">{attMessage}</p>}
                </div>

                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">// Attendance Timeline History</h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 flex-1">
                    {attendance.map(a => (
                      <div key={a.id} className="bg-white p-3 rounded-xl text-xs flex justify-between items-center border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800">{a.student_name}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{a.date} ({a.course_code})</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          a.status === 'Present' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>{a.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notices' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Notice Board System
                  </h2>
                  <form onSubmit={handleCreateNotice} className="space-y-3">
                    <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="NOTICE_HEADER_STRING *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                    <textarea value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="ALERT_BODY_SUMMARY *" rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 resize-none" />
                    <select value={noticeCategory} onChange={(e) => setNoticeCategory(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-700">
                      <option value="Academic">ACADEMIC_SYSTEM</option>
                      <option value="Urgent">CRITICAL_EMERGENCY</option>
                      <option value="Placement">PLACEMENT_VECTOR</option>
                    </select>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm">DISPATCH ANNOUNCEMENT</button>
                  </form>
                  {noticeMessage && <p className="text-xs text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-indigo-700">{noticeMessage}</p>}
                </div>

                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">// Active Board Announcements</h3>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 flex-1">
                    {notices.map(n => (
                      <div key={n.id} className="bg-white p-3 rounded-xl text-xs space-y-1 border border-slate-100 hover:border-indigo-200 shadow-sm transition-all">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-850">{n.title}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            n.category === 'Urgent' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>{n.category.toUpperCase()}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                {/* Layered Campus Blueprint Vector Map */}
                <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
                    <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span> 2D Spatial Layout Blueprint
                    </h2>
                    {/* Floor Selector Buttons */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[10px] font-bold">
                      {(['GF', 'FF', 'SF', 'TF', '4F'] as const).map(floor => (
                        <button
                          key={floor}
                          onClick={() => { setSelectedFloor(floor); setSelectedRoom(null); }}
                          className={`px-3 py-1.5 rounded-md transition-all uppercase ${selectedFloor === floor ? 'bg-white text-indigo-750 shadow-sm border border-slate-200' : 'text-slate-550 hover:text-slate-800'}`}
                        >
                          {floor}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    College of Engineering Chengannur Main Block Complex map layout. Left wing hosts laboratory suites, center contains public facilities, and right wing houses lecture halls. Click on any room to inspect spatial metadata.
                  </p>

                  {/* Interactive Blueprint Map Grid */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 aspect-[16/10] relative">
                    {floorBlueprints[selectedFloor].map(room => (
                      <div
                        key={room.code}
                        onClick={() => setSelectedRoom(room)}
                        className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm ${room.gridArea} ${selectedRoom?.code === room.code ? 'ring-2 ring-indigo-500 scale-[1.01] shadow-md border-indigo-400' : 'border-slate-200/60'}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-[10px] tracking-wider">{room.code}</span>
                          <span className="text-[8px] bg-white/70 px-1 py-0.5 rounded font-bold uppercase tracking-wider">{room.dept}</span>
                        </div>
                        <div>
                          <p className="font-bold text-xs leading-snug line-clamp-2">{room.name}</p>
                          <p className="text-[8px] opacity-75 mt-0.5 line-clamp-1">{room.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Room Metadata Details preview card */}
                  {selectedRoom ? (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold text-xs">{selectedRoom.code}</span>
                          <h4 className="font-bold text-slate-900 text-sm">{selectedRoom.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Department: {selectedRoom.dept}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedRoom.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          setNodeName(`${selectedRoom.code}: ${selectedRoom.name}`);
                          setNodeType(selectedRoom.name.includes("Lab") ? "Lab" : selectedRoom.name.includes("Classroom") ? "Classroom" : selectedRoom.name.includes("Faculty") ? "Cabin" : "Building");
                          setNodeDetails(`Floor: ${selectedFloor === 'GF' ? 'Ground Floor' : selectedFloor === 'FF' ? 'First Floor' : selectedFloor === 'SF' ? 'Second Floor' : selectedFloor === 'TF' ? 'Third Floor' : 'Fourth Floor'}, Dept: ${selectedRoom.dept}, Notes: ${selectedRoom.desc}`);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-3.5 py-2 rounded-lg shadow-sm whitespace-nowrap"
                      >
                        + Load into form
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450 italic text-center py-4 bg-slate-50 border border-slate-150 rounded-xl">Click a room on the interactive floor blueprint above to view spatial descriptions.</p>
                  )}
                </div>

                {/* Locations list and input form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                    <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Geospatial Mapper Input
                    </h2>
                    <form onSubmit={handleCreateNode} className="space-y-3">
                      <input type="text" value={nodeName} onChange={(e) => setNodeName(e.target.value)} placeholder="SPACE_SECTOR_IDENTIFIER *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400" />
                      <select value={nodeType} onChange={(e) => setNodeType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-700">
                        <option value="Building">SECTOR_BUILDING</option>
                        <option value="Classroom">CORE_CLASSROOM</option>
                        <option value="Lab">QUANTUM_LABORATORY</option>
                        <option value="Cabin">FACULTY_CABIN_POINT</option>
                      </select>
                      <textarea value={nodeDetails} onChange={(e) => setNodeDetails(e.target.value)} placeholder="GEOMETRIC_NAVIGATION_MARKERS *" rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 resize-none" />
                      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm">MAP LOCATION COORDINATE</button>
                    </form>
                    {nodeMessage && <p className="text-xs text-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-indigo-700">{nodeMessage}</p>}
                  </div>

                  <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3">// Mapped Campus Facilities</h3>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 flex-1">
                      {mapNodes.map(n => (
                        <div key={n.id} className="bg-white p-3 rounded-xl text-xs space-y-1 border border-slate-100 hover:border-indigo-200 shadow-sm transition-all">
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-slate-800">{n.name}</p>
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-bold">{n.type.toUpperCase()}</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{n.location_details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-sm font-bold tracking-wide text-indigo-900 uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Database Analytics & Statistics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Students</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{students.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Courses</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{courses.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grades Logged</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{grades.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Faculty Count</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{faculty.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notice Alerts</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{notices.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-inner col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Map Vectors</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-1">{mapNodes.length}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 font-mono leading-relaxed">
                  // DATABASE REPORT: RELATIONAL SCHEMA ALIGNMENT STABLE. API RESPONSE TIMELINES CALIBRATED UNDER LIMITS.
                </div>
              </div>
            )}
          </div>

          {/* Academic AI Advisor Panel (Right Column) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-[520px]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/85 flex justify-between items-center shadow-sm">
              <span className="text-xs font-bold tracking-wider text-indigo-900 uppercase">Academic Advisor AI</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200/50 font-bold">GEMINI LINK</span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl h-[330px] overflow-y-auto text-xs text-slate-700 border border-slate-200/80 whitespace-pre-line leading-relaxed shadow-inner pr-1">
                {aiResponse}
              </div>
              
              <form onSubmit={handleAskGemma} className="flex gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask advisor about student metrics..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 transition-colors shadow-inner"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "ASK"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Global Performance Analysis Diagnostic Ledger (Bottom Block) */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-4">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span> GLOBAL STUDENT PERFORMANCE AUDIT & SYNTHESIS
            </h3>
            <button
              onClick={triggerGlobalAudit}
              disabled={isInsightLoading}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm w-full sm:w-auto text-center"
            >
              {isInsightLoading ? "PROCESSING UNIVERSITY DATABASE METRICS..." : "RUN INTER-RELATIONAL PERFORMANCE AUDIT"}
            </button>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 min-h-[100px] whitespace-pre-line leading-relaxed shadow-inner pr-1">
            {aiInsights}
          </div>
        </div>

      </div>
    </div>
  )
}

export default App