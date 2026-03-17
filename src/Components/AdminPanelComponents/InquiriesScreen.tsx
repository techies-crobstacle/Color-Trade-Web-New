'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, ArrowForward, Refresh } from '@mui/icons-material';

interface Inquiry {
  _id: string;
  name: string;
  number: string;
  queryType: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: string;
  page: number;
  totalPages: number;
  totalResults: number;
  queries: Inquiry[];
}

export default function InquiriesTable() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [availableQueryTypes, setAvailableQueryTypes] = useState<string[]>([]);

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
  const API_ENDPOINT = `${API_BASE_URL}/api/queries/all`;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== search) return; // Only reset when debounced search is set
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch available query types for filter dropdown
  const fetchQueryTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}?limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (result.status === 'success' && result.queries) {
          const uniqueTypes = [...new Set(result.queries.map(q => q.queryType))];
          setAvailableQueryTypes(uniqueTypes);
        }
      }
    } catch (err) {
      console.error('Error fetching query types:', err);
    }
  }, [API_ENDPOINT]);

  // Fetch inquiries from API
  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
      });

      // Add search parameter if exists
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      // Add query type filter if not 'All'
      if (selectedTitle !== 'All') {
        params.append('queryType', selectedTitle);
      }

      // Add sort parameter if not default
      if (sortOrder !== 'default') {
        params.append('sort', sortOrder);
      }

      const response = await fetch(`${API_ENDPOINT}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 'success') {
        setInquiries(result.queries || []);
        setTotalCount(result.totalResults || 0);
      } else {
        throw new Error('API returned error status');
      }
      
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
      setInquiries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, debouncedSearch, selectedTitle, sortOrder, API_ENDPOINT]);

  // Initial load - fetch query types and inquiries
  useEffect(() => {
    fetchQueryTypes();
  }, [fetchQueryTypes]);

  // Fetch inquiries when dependencies change
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Create titles array with available query types
  const titles = ['All', ...availableQueryTypes];
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / entriesPerPage);

  // Manual refresh function
  const handleRefresh = () => {
    fetchQueryTypes();
    fetchInquiries();
  };

  // Handle filter changes
  const handleQueryTypeChange = (value: string) => {
    setSelectedTitle(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handleEntriesPerPageChange = (value: number) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  return (
    <Box className="space-y-6 text-black">
      {/* Header with Refresh Button */}
      <Box className="flex justify-between items-center">
        <Typography variant="h5" component="h1" className="font-semibold">
          Customer Queries
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box className="flex flex-wrap justify-between items-center gap-4">
        <TextField
          variant="outlined"
          size="small"
          label="Search"
          placeholder="Search by name, number, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 250 }}
          disabled={loading}
        />

        <FormControl size="small" disabled={loading} sx={{ minWidth: 120 }}>
          <InputLabel>Query Type</InputLabel>
          <Select
            value={selectedTitle}
            label="Query Type"
            onChange={(e) => handleQueryTypeChange(e.target.value as string)}
          >
            {titles.map((title, idx) => (
              <MenuItem key={idx} value={title}>
                {title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" disabled={loading} sx={{ minWidth: 120 }}>
          <InputLabel>Sort</InputLabel>
          <Select
            value={sortOrder}
            label="Sort"
            onChange={(e) => handleSortChange(e.target.value as string)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="date-desc">Newest First</MenuItem>
            <MenuItem value="date-asc">Oldest First</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" disabled={loading} sx={{ minWidth: 100 }}>
          <InputLabel>Entries</InputLabel>
          <Select
            value={entriesPerPage}
            label="Entries"
            onChange={(e) => handleEntriesPerPageChange(Number(e.target.value))}
          >
            {[5, 10, 25, 50].map((num) => (
              <MenuItem key={num} value={num}>{num}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Pagination */}
        <Box className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            size="small"
            variant="outlined"
          >
            <ArrowBack />
          </Button>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            Page {currentPage} of {totalPages || 1}
          </Typography>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading || totalPages === 0}
            size="small"
            variant="outlined"
          >
            <ArrowForward />
          </Button>
        </Box>
      </Box>

      {/* Results Info */}
      <Box className="flex justify-between items-center">
        <Typography variant="body2" color="textSecondary">
          {loading ? 'Loading...' : `Showing ${inquiries.length} of ${totalCount} results`}
        </Typography>
        {(debouncedSearch || selectedTitle !== 'All' || sortOrder !== 'default') && (
          <Typography variant="body2" color="primary">
            Filters applied
          </Typography>
        )}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className="shadow-md">
        <Table>
          <TableHead sx={{ backgroundColor: "#1f1f1f" }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mobile Number</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Query Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Message</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Loading inquiries...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <TableRow key={inq._id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {inq.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {inq.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: getQueryTypeColor(inq.queryType),
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        textTransform: 'capitalize',
                      }}
                    >
                      {inq.queryType}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      title={inq.message}
                    >
                      {inq.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: getStatusColor(inq.status),
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        textTransform: 'capitalize',
                      }}
                    >
                      {inq.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {error ? 'Failed to load queries' : 'No queries found'}
                  </Typography>
                  {!error && (debouncedSearch || selectedTitle !== 'All') && (
                    <Typography variant="body2" color="textSecondary">
                      Try adjusting your filters or search terms
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Info */}
      {totalPages > 1 && (
        <Box className="flex justify-center items-center gap-4 mt-4">
          <Typography variant="body2" color="textSecondary">
            Total: {totalCount} queries across {totalPages} pages
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Helper functions for styling
function getQueryTypeColor(queryType: string): string {
  const colors: Record<string, string> = {
    'payment': '#f44336',
    'technical': '#ff9800',
    'account': '#2196f3',
    'support': '#9c27b0',
    'general': '#4caf50',
    'billing': '#e91e63',
    'other': '#607d8b',
  };
  return colors[queryType.toLowerCase()] || '#607d8b';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': '#ff9800',
    'resolved': '#4caf50',
    'in-progress': '#2196f3',
    'in progress': '#2196f3',
    'closed': '#607d8b',
    'open': '#f44336',
  };
  return colors[status.toLowerCase()] || '#ff9800';
}