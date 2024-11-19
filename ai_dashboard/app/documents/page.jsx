"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Calendar, Trash2, Search, Grid, List, Filter, SortDesc } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/context/workspace-context";
import { customToast } from "@/components/ui/toast-theme";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GeneratedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'type'
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, [currentWorkspace]);

  useEffect(() => {
    // Filter and sort reports based on search query and sort option
    let filtered = reports;
    
    if (searchQuery) {
      filtered = reports.filter(report => 
        report.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.sub_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'type':
          return (a.sub_type || a.document_type).localeCompare(b.sub_type || b.document_type);
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchQuery, sortBy]);

  const loadReports = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentWorkspace) {
        query = query.eq('workspace_id', currentWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, reportId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('generated_reports')
        .delete()
        .match({ 
          id: reportId,
          user_id: (await supabase.auth.getUser()).data.user.id 
        });

      if (error) {
        throw error;
      }
      
      customToast.success('Report deleted successfully');
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      customToast.error(error.message || 'Failed to delete report');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold">Generated Documents</h1>
        <Link href="/create-document">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            Generate New Document
          </Button>
        </Link>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SortDesc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                By Type
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center space-x-1 border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-muted' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-muted' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Link key={report.id} href={`/documents/${report.id}`}>
              <Card className={`group hover:shadow-md transition-all ${
                viewMode === 'list' ? 'p-3' : 'p-4'
              }`}>
                <div className={`flex ${viewMode === 'list' ? 'items-center' : 'flex-col'} gap-4`}>
                  <div className={`flex items-center ${viewMode === 'list' ? 'flex-1' : 'w-full'}`}>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h3 className="font-medium truncate">
                        {report.sub_type || report.document_type}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {report.content.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex ${viewMode === 'list' ? 'items-center' : 'items-end'} gap-3`}>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                        onClick={(e) => handleDelete(e, report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            {searchQuery ? (
              <div className="space-y-4">
                <Search className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No matching documents found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or clear the search
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No documents generated yet
                  </h3>
                  <p className="text-gray-500">
                    Start by generating your first document
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 