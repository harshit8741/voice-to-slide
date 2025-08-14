// Modern dashboard with glassmorphism cards and analytics

'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api';
import { User } from '@/types';
import { Users, UserPlus, Activity, Clock, TrendingUp, Target, Sparkles, BarChart3, Presentation, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await userApi.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const newThisMonth = users.filter(u => {
    const createdAt = new Date(u.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth();
  }).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 border border-border mb-4">
              <Sparkles className="w-4 h-4 text-accent mr-2" />
              <span className="text-sm text-muted-foreground">Your Learning Dashboard</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Welcome back, <span className="gradient-text">{user?.firstName}</span>!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your progress, analyze your performance, and discover new learning opportunities.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm text-success bg-success/10 px-2 py-1 rounded-lg">
                  +12.5%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Learners</p>
                <p className="text-3xl font-bold text-foreground">{users.length}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm text-success bg-success/10 px-2 py-1 rounded-lg">
                  +{newThisMonth > 0 ? '8.2' : '0'}%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">New This Month</p>
                <p className="text-3xl font-bold text-foreground">{newThisMonth}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm text-success bg-success/10 px-2 py-1 rounded-lg">
                  +24.1%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Today</p>
                <p className="text-3xl font-bold text-foreground">127</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm text-warning bg-warning/10 px-2 py-1 rounded-lg">
                  -2.1%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Session</p>
                <p className="text-3xl font-bold text-foreground">42m</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h2>
              <p className="text-muted-foreground">Get started with AI-powered slide generation</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/audio-to-slides" className="group">
                <div className="glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent group-hover:border-accent/50">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center mr-4">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                        Voice to Slides
                      </h3>
                      <p className="text-sm text-muted-foreground">Record or upload audio to create slides</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Record your voice or upload audio files, and AI will automatically create structured presentation slides.
                  </p>
                  <div className="mt-4 flex items-center text-accent text-sm font-medium">
                    <span>Get started</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/presentations" className="group">
                <div className="glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent group-hover:border-accent/50">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-hover to-accent rounded-xl flex items-center justify-center mr-4">
                      <Presentation className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                        My Presentations
                      </h3>
                      <p className="text-sm text-muted-foreground">View and manage your slides</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Browse through your collection of generated presentations and view them with our interactive slide viewer.
                  </p>
                  <div className="mt-4 flex items-center text-accent text-sm font-medium">
                    <span>View all</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 glass rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Learning Analytics</h2>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last 30 days</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Course Completion</span>
                    <span className="text-sm font-bold text-foreground">87%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Skills Mastery</span>
                    <span className="text-sm font-bold text-foreground">72%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Engagement Score</span>
                    <span className="text-sm font-bold text-foreground">94%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Goals</h2>
                <Target className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Complete React Course</p>
                    <p className="text-xs text-muted-foreground">Due in 5 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Master TypeScript</p>
                    <p className="text-xs text-muted-foreground">Due in 12 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Build Portfolio</p>
                    <p className="text-xs text-muted-foreground">Due in 20 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Community Members</h2>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-sm text-success">Growing</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading community data...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No community members yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Member</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Joined</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {users.slice(0, 8).map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                  {userItem.firstName.charAt(0)}{userItem.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-foreground">
                                  {userItem.firstName} {userItem.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">{userItem.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

