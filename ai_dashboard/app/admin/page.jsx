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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { customToast } from "@/components/ui/toast-theme";
import { MegaphoneIcon } from "lucide-react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    link: '',
    priority: 0
  });
  const supabase = createClient();

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
    fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      customToast.error("Failed to fetch announcements");
      return;
    }

    setAnnouncements(data);
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('announcements')
      .insert([newAnnouncement])
      .select()
      .single();

    if (error) {
      customToast.error("Failed to create announcement");
      return;
    }

    setAnnouncements([data, ...announcements]);
    setNewAnnouncement({ title: '', content: '', link: '', priority: 0 });
    customToast.success("Announcement created successfully");
  };

  const deleteAnnouncement = async (id) => {
    try {
      // First, delete the announcement
      const { error: deleteError } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        customToast.error("Failed to delete announcement");
        return;
      }

      // Then refetch the announcements to ensure we have the latest data
      const { data: freshData, error: fetchError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        customToast.error("Failed to refresh announcements");
        return;
      }

      setAnnouncements(freshData);
      customToast.success("Announcement deleted successfully");
    } catch (error) {
      console.error('Error:', error);
      customToast.error("An unexpected error occurred");
    }
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
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
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Create New Announcement</h2>
            <form onSubmit={createAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({
                    ...newAnnouncement,
                    title: e.target.value
                  })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <Textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({
                    ...newAnnouncement,
                    content: e.target.value
                  })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (optional)</label>
                <Input
                  value={newAnnouncement.link}
                  onChange={(e) => setNewAnnouncement({
                    ...newAnnouncement,
                    link: e.target.value
                  })}
                />
              </div>
              <Button type="submit">Create Announcement</Button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                <img src="/megaphone.png" className="h-12 w-12" alt="Megaphone" />
                <h3 className="font-semibold text-lg">No announcements yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first announcement using the form above.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>{announcement.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {announcement.content}
                      </TableCell>
                      <TableCell>
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAnnouncement(announcement.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
} 