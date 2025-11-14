-- Row Level Security Policies for LMS Portal

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Internships table policies
CREATE POLICY "Anyone can view published internships" ON internships
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all internships" ON internships
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can create internships" ON internships
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update their own internships" ON internships
    FOR UPDATE USING (
        created_by = auth.uid() AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        created_by = auth.uid() AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete their own internships" ON internships
    FOR DELETE USING (
        created_by = auth.uid() AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Applications table policies
CREATE POLICY "Students can view their own applications" ON applications
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Students can create their own applications" ON applications
    FOR INSERT WITH CHECK (
        student_id = auth.uid() AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student')
    );

CREATE POLICY "Students can update their own pending applications" ON applications
    FOR UPDATE USING (
        student_id = auth.uid() AND 
        status = 'pending' AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student')
    )
    WITH CHECK (
        student_id = auth.uid() AND 
        status = 'pending' AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'student')
    );

CREATE POLICY "Admins can update application status" ON applications
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Courses table policies
CREATE POLICY "Students can view courses for their approved internships" ON courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.student_id = auth.uid() 
            AND applications.internship_id = courses.internship_id 
            AND applications.status = 'approved'
        ) OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all courses" ON courses
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Student courses table policies
CREATE POLICY "Students can view their own course enrollments" ON student_courses
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can view all student course enrollments" ON student_courses
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Students can enroll in courses for approved internships" ON student_courses
    FOR INSERT WITH CHECK (
        student_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.student_id = auth.uid() 
            AND applications.internship_id = (
                SELECT internship_id FROM courses WHERE id = course_id
            ) 
            AND applications.status = 'approved'
        )
    );

CREATE POLICY "Students can update their own course progress" ON student_courses
    FOR UPDATE USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Attendance table policies
CREATE POLICY "Students can view their own attendance" ON attendance
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can view all attendance records" ON attendance
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can create attendance records" ON attendance
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update attendance records" ON attendance
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Meetings table policies
CREATE POLICY "Students can view meetings for their approved internships" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.student_id = auth.uid() 
            AND applications.internship_id = meetings.internship_id 
            AND applications.status = 'approved'
        ) OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all meetings" ON meetings
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Documents table policies
CREATE POLICY "Users can view documents they uploaded" ON documents
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Students can view documents related to their approved internships" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.student_id = auth.uid() 
            AND applications.status = 'approved'
            AND (
                (documents.related_type = 'internship' AND documents.related_id::uuid = applications.internship_id) OR
                (documents.related_type = 'application' AND documents.related_id::uuid = applications.id)
            )
        ) OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all documents" ON documents
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Notifications table policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON users TO anon, authenticated;
GRANT INSERT ON users TO anon, authenticated;
GRANT UPDATE ON users TO authenticated;

GRANT SELECT ON internships TO anon, authenticated;
GRANT INSERT ON internships TO authenticated;
GRANT UPDATE ON internships TO authenticated;
GRANT DELETE ON internships TO authenticated;

GRANT SELECT ON applications TO anon, authenticated;
GRANT INSERT ON applications TO authenticated;
GRANT UPDATE ON applications TO authenticated;

GRANT SELECT ON courses TO anon, authenticated;
GRANT INSERT ON courses TO authenticated;
GRANT UPDATE ON courses TO authenticated;
GRANT DELETE ON courses TO authenticated;

GRANT SELECT ON student_courses TO anon, authenticated;
GRANT INSERT ON student_courses TO authenticated;
GRANT UPDATE ON student_courses TO authenticated;
GRANT DELETE ON student_courses TO authenticated;

GRANT SELECT ON attendance TO anon, authenticated;
GRANT INSERT ON attendance TO authenticated;
GRANT UPDATE ON attendance TO authenticated;
GRANT DELETE ON attendance TO authenticated;

GRANT SELECT ON meetings TO anon, authenticated;
GRANT INSERT ON meetings TO authenticated;
GRANT UPDATE ON meetings TO authenticated;
GRANT DELETE ON meetings TO authenticated;

GRANT SELECT ON documents TO anon, authenticated;
GRANT INSERT ON documents TO authenticated;
GRANT UPDATE ON documents TO authenticated;
GRANT DELETE ON documents TO authenticated;

GRANT SELECT ON notifications TO anon, authenticated;
GRANT INSERT ON notifications TO authenticated;
GRANT UPDATE ON notifications TO authenticated;
GRANT DELETE ON notifications TO authenticated;