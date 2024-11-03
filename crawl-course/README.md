# HCMUT Course Crawler

A Python script designed to automatically fetch and update course information from Ho Chi Minh City University of Technology's Learning Management System (LMS) into the chat application's Supabase database.

## 🔄 Overview

This crawler operates on a monthly schedule via GitHub Actions to:

- Retrieve the latest course listings from the LMS.
- Process and format course names.
- Update the Supabase database with new course data for seamless integration in the chat application.

## 🛠️ Components

- **`crawl.py`** - The primary script for data retrieval and processing.

## ⚙️ How It Works

### 1. Course Data Collection

The crawler fetches course data for a specific semester and processes it for updates:

```python
def crawl_courses(HK):
    # Fetches course data from LMS for the specified semester
    # Returns formatted course names
```

### 2. Data Processing

Course names are processed to improve readability by removing unnecessary codes and retaining only descriptive names:

```python
def process_course_name(course_name):
    # Cleans and formats course names
    # Strips course codes, keeps only descriptive content
```

### 3. Database Updates

Functions to update the Supabase database, including clearing outdated data and adding new course entries:

```python
def clear_tables():
    # Clears existing course data in the database

def add_courses_to_rooms(course_names):
    # Inserts new course names into the rooms table
```

## 🔧 Configuration

The crawler requires these environment variables for database access:

- **`SUPABASE_URL`**: Supabase database URL
- **`SUPABASE_KEY`**: API key for accessing the database

## 🚀 Manual Execution

To run the crawler manually on your local machine:

1. **Install dependencies**:

   ```bash
   pip install requests beautifulsoup4 supabase
   ```

2. **Run the script**:
   ```bash
   python crawl.py
   ```

## 📝 Notes

- Only crawls course data for the current semester.
- Replaces the entire course list with new data on each run.
