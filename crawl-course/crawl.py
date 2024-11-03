import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Hàm để xử lý tên khóa học
def process_course_name(course_name):
    parts = course_name.split(' ', 1)
    if len(parts) > 1:
        return parts[1]
    return course_name

# Hàm để crawl dữ liệu
def crawl_courses(HK):
    url = f"https://lms.hcmut.edu.vn/course/search.php?search={HK}&perpage=all"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    courses = soup.find_all('h3', class_='coursename')
    course_names = []
    for course in courses:
        course_name = course.get_text(strip=True)
        processed_name = process_course_name(course_name)
        course_names.append(processed_name)
    return course_names

# Kết nối với Supabase
url = "https://tdxlkbnxwjdxcphlncwi.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGxrYm54d2pkeGNwaGxuY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMzQ1MDQsImV4cCI6MjA0MTYxMDUwNH0.hD7V62SpuPz6iaW3UavLAhU4MCxgjhry3zaspcxJ-sM"
supabase: Client = create_client(url, key)

# Hàm để xóa dữ liệu trong các bảng
def clear_tables():
    supabase.table("messages").delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    supabase.table("user_interests").delete().neq('user_id', '00000000-0000-0000-0000-000000000000').execute()
    supabase.table("rooms").delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

# Hàm để thêm dữ liệu vào bảng rooms
def add_courses_to_rooms(course_names):
    for name in course_names:
        supabase.table("rooms").insert({"name": name}).execute()

# Thực hiện các bước
HK = "HK241"  # Thay 'HK' bằng giá trị bạn muốn tìm kiếm
course_names = crawl_courses(HK)
clear_tables()
add_courses_to_rooms(course_names)

