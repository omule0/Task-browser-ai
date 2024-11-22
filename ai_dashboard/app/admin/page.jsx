"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { customToast } from "@/components/ui/toast-theme";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    setIsAdmin(profile?.is_admin || false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('email');

    if (error) {
      customToast.error("Failed to fetch users");
      return;
    }

    setUsers(data);
    setLoading(false);
  };

  const toggleAdmin = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (error) {
      customToast.error("Failed to update admin status");
      return;
    }

    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, is_admin: !currentStatus }
        : user
    ));

    customToast.success("Admin status updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold">Access Denied</h1>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_admin}
                    onCheckedChange={() => toggleAdmin(user.id, user.is_admin)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => {/* Implement view details */}}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
} 