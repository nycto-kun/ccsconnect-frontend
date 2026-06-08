import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, AlertCircle, GraduationCap, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const Interns = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Fetch all students
        const studentsRes = await api.get('/admin/users?role=student');
        setStudents(studentsRes.data || []);
        
        // Fetch applications to see who has offers
        const appsRes = await api.get('/applications');
        setApplications(appsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        setStudents([]);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'admin') {
      fetchStudents();
    }
  }, [user]);

  // Find students without active internships (no accepted applications)
  const studentsWithoutInternship = students.filter(student => {
    const hasAcceptedOffer = applications.some(app => 
      app.student_id === student.id && app.status === 'accepted'
    );
    return !hasAcceptedOffer;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Students Without Active Internship
        </h2>
        <Badge variant="outline" className="text-sm">
          {studentsWithoutInternship.length} students
        </Badge>
      </div>

      {studentsWithoutInternship.length === 0 ? (
        <Card className="border-0 shadow-md dark:bg-gray-800">
          <CardContent className="py-16 text-center text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No students currently without an active internship.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentsWithoutInternship.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                        {student.full_name || 'Student'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      No Internship
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <GraduationCap className="w-4 h-4" />
                      <span>{student.department || 'Department not set'} · {student.year || 'Year not set'}</span>
                    </div>
                    {student.gpa && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">CGPA</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{student.gpa} / 10</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => window.location.href = `/students/${student.id}`}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};