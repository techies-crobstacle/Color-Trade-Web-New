'use client';

import { useState, useEffect } from 'react';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, ArrowForward, Refresh, Visibility, EmojiEvents } from '@mui/icons-material';

interface GameStats {
  period: string;
  message?: string;
  totalByNumber?: Record<string, number>;
  totalByColor?: {
    Red: number;
    Green: number;
    Violet: number;
  };
  totalBySize?: {
    big: number;
    small: number;
  };
  profitLossByNumber?: Record<string, {
    payout: number;
    profit: number;
    colors: string[];
  }>;
}

interface ApiResponse {
  status: string;
  statusCode: number;
  message: string;
  data: Record<string, GameStats>; // Changed from GameStats[] to Record<string, GameStats>
}

export default function GameStatsTable() {
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Set Winner Modal State
  const [setWinnerModal, setSetWinnerModal] = useState<boolean>(false);
  const [selectedGamePeriod, setSelectedGamePeriod] = useState<string>('');
  const [selectedWinningNumber, setSelectedWinningNumber] = useState<number>(0);
  const [settingWinner, setSettingWinner] = useState<boolean>(false);

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ctbackend.crobstacle.com";
  const API_ENDPOINT = `${API_BASE_URL}/api/admin/game-stats`;
  const SET_WINNER_ENDPOINT = `${API_BASE_URL}/api/admin/set-winner`;

  // Fetch game stats from API
  const fetchGameStats = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 'success') {
        // Convert the object structure to array and sort from latest to oldest
        const gameStatsArray = Object.values(result.data || {});
        
        const sortedData = gameStatsArray.sort((a, b) => {
          // Extract timestamp from period (format: 3m-YYYYMMDD-HHMM-Round)
          const getTimestamp = (period: string) => {
            const parts = period.split('-');
            if (parts.length >= 4) {
              const date = parts[1]; // YYYYMMDD
              const time = parts[2]; // HHMM
              const round = parts[3]; // Round number
              // Create comparable string: YYYYMMDDHHMM + padded round
              return date + time + round.padStart(4, '0');
            }
            return period;
          };
          
          const timestampA = getTimestamp(a.period);
          const timestampB = getTimestamp(b.period);
          
          // Sort descending (latest first)
          return timestampB.localeCompare(timestampA);
        });
        
        setGameStats(sortedData);
      } else {
        throw new Error(result.message || 'API returned error status');
      }
      
    } catch (err) {
      console.error('Error fetching game stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch game stats');
      setGameStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchGameStats();
  }, []);

  // Filter and pagination logic
  const filteredStats = gameStats.filter(stat => {
    const matchesSearch = stat.period.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && !stat.message) ||
      (statusFilter === 'No Bets' && stat.message);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStats.length / entriesPerPage);
  const paginatedStats = filteredStats.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Helper functions
  const formatPeriod = (period: string) => {
    const parts = period.split('-');
    if (parts.length >= 3) {
      const date = parts[1];
      const time = parts[2];
      const round = parts[3];
      return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${time.slice(0, 2)}:${time.slice(2, 4)} R${round}`;
    }
    return period;
  };

  const getStatusColor = (stat: GameStats) => {
    return stat.message ? '#ff9800' : '#4caf50';
  };

  const getStatusLabel = (stat: GameStats) => {
    return stat.message ? 'No Bets' : 'Active';
  };

  const getTotalProfit = (profitLoss: Record<string, { profit: number }>) => {
    return Object.values(profitLoss).reduce((sum, item) => sum + item.profit, 0);
  };

  const toggleRowExpansion = (period: string) => {
    setExpandedRow(expandedRow === period ? null : period);
  };

  // Set Winner Functions
  const openSetWinnerModal = (period: string) => {
    setSelectedGamePeriod(period);
    setSelectedWinningNumber(0);
    setSetWinnerModal(true);
  };

  const closeSetWinnerModal = () => {
    setSetWinnerModal(false);
    setSelectedGamePeriod('');
    setSelectedWinningNumber(0);
  };

  const handleSetWinner = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Authentication token not found. Please login again.');
      return;
    }

    if (!selectedGamePeriod || selectedWinningNumber < 0 || selectedWinningNumber > 9) {
      setError('Please select a valid winning number (0-9)');
      return;
    }

    try {
      setSettingWinner(true);
      setError('');

      const response = await fetch(SET_WINNER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          period: selectedGamePeriod,
          selectedWinningNumber: selectedWinningNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        closeSetWinnerModal();
        // Refresh the game stats to show updated data
        await fetchGameStats();
        // You could also show a success message here
      } else {
        throw new Error(result.message || 'Failed to set winner');
      }
      
    } catch (err) {
      console.error('Error setting winner:', err);
      setError(err instanceof Error ? err.message : 'Failed to set winner');
    } finally {
      setSettingWinner(false);
    }
  };

  return (
    <Box className="space-y-6 text-black">
      {/* Header */}
      <Box className="flex justify-between items-center">
        <Typography variant="h5" component="h1" className="font-semibold">
          Game Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchGameStats}
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
          label="Search Period"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 250 }}
          disabled={loading}
        />

        <FormControl size="small" disabled={loading}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="No Bets">No Bets</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" disabled={loading}>
          <InputLabel>Entries</InputLabel>
          <Select
            value={entriesPerPage}
            label="Entries"
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
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
          >
            <ArrowBack />
          </Button>
          <Typography variant="body2">
            Page {currentPage} of {totalPages || 1}
          </Typography>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading || totalPages === 0}
            size="small"
          >
            <ArrowForward />
          </Button>
        </Box>
      </Box>

      {/* Results Info */}
      <Box className="flex justify-between items-center">
        <Typography variant="body2" color="textSecondary">
          {loading ? 'Loading...' : `Showing ${paginatedStats.length} of ${filteredStats.length} results`}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className="shadow-md">
        <Table>
          <TableHead sx={{ backgroundColor: "#1f1f1f" }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Period</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Total Bets</TableCell>
              <TableCell sx={{ color: 'white' }}>Total Profit</TableCell>
              <TableCell sx={{ color: 'white' }}>Numbers</TableCell>
              <TableCell sx={{ color: 'white' }}>Colors (R/G/V)</TableCell>
              <TableCell sx={{ color: 'white' }}>Size (Big/Small)</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : paginatedStats.length > 0 ? (
              paginatedStats.map((stat) => (
                <>
                  <TableRow key={stat.period} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {formatPeriod(stat.period)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(stat)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(stat),
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {stat.totalByNumber ? 
                          Object.values(stat.totalByNumber).reduce((sum, val) => sum + val, 0) : 
                          0
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: stat.profitLossByNumber ? 
                            (getTotalProfit(stat.profitLossByNumber) >= 0 ? '#4caf50' : '#f44336') : 
                            'inherit',
                          fontWeight: 'bold'
                        }}
                      >
                        {stat.profitLossByNumber ? 
                          (getTotalProfit(stat.profitLossByNumber) > 0 ? '+' : '') + getTotalProfit(stat.profitLossByNumber) : 
                          'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {stat.totalByNumber ? (
                        <Box className="flex flex-wrap gap-1">
                          {Object.entries(stat.totalByNumber).map(([number, count]) => (
                            <Chip
                              key={number}
                              label={`${number}:${count}`}
                              size="small"
                              sx={{ 
                                backgroundColor: '#2196f3', 
                                color: 'white', 
                                fontSize: '0.65rem',
                                minWidth: 'auto'
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                          No data
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {stat.totalByColor ? (
                        <Box className="flex gap-1 flex-wrap">
                          <Chip 
                            label={stat.totalByColor.Red} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#f44336', 
                              color: 'white', 
                              fontSize: '0.65rem',
                              minWidth: '25px'
                            }} 
                          />
                          <Chip 
                            label={stat.totalByColor.Green} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#4caf50', 
                              color: 'white', 
                              fontSize: '0.65rem',
                              minWidth: '25px'
                            }} 
                          />
                          <Chip 
                            label={stat.totalByColor.Violet} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#9c27b0', 
                              color: 'white', 
                              fontSize: '0.65rem',
                              minWidth: '25px'
                            }} 
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                          No data
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {stat.totalBySize ? (
                        <Box className="flex gap-1">
                          <Chip 
                            label={stat.totalBySize.big}
                            size="small"
                            sx={{ 
                              backgroundColor: '#607d8b', 
                              color: 'white', 
                              fontSize: '0.65rem',
                              minWidth: '25px'
                            }}
                            title="Big"
                          />
                          <Chip 
                            label={stat.totalBySize.small}
                            size="small"
                            sx={{ 
                              backgroundColor: '#795548', 
                              color: 'white', 
                              fontSize: '0.65rem',
                              minWidth: '25px'
                            }}
                            title="Small"
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                          No data
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {!stat.message ? (
                        <Box className="flex gap-1 flex-wrap">
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => toggleRowExpansion(stat.period)}
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {expandedRow === stat.period ? 'Hide' : 'Details'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EmojiEvents />}
                            onClick={() => openSetWinnerModal(stat.period)}
                            sx={{ 
                              fontSize: '0.7rem',
                              backgroundColor: '#ff9800',
                              '&:hover': {
                                backgroundColor: '#f57c00'
                              }
                            }}
                          >
                            Set Winner
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                          {stat.message}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row Details */}
                  {expandedRow === stat.period && stat.profitLossByNumber && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                        <Box className="p-4">
                          <Typography variant="h6" className="mb-4" sx={{ color: '#495057', fontWeight: 600 }}>
                            Detailed Analysis for {formatPeriod(stat.period)}
                          </Typography>
                          
                          {/* Summary Cards */}
                          <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                              <Typography variant="subtitle2" color="textSecondary">Total Numbers Bet</Typography>
                              <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                {stat.totalByNumber ? Object.keys(stat.totalByNumber).length : 0}
                              </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                              <Typography variant="subtitle2" color="textSecondary">Total Amount</Typography>
                              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                {stat.totalByNumber ? Object.values(stat.totalByNumber).reduce((sum, val) => sum + val, 0) : 0}
                              </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                              <Typography variant="subtitle2" color="textSecondary">Total Payout</Typography>
                              <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                                {Object.values(stat.profitLossByNumber).reduce((sum, item) => sum + item.payout, 0)}
                              </Typography>
                            </Box>
                            <Box sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                              <Typography variant="subtitle2" color="textSecondary">Net Profit</Typography>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: getTotalProfit(stat.profitLossByNumber) >= 0 ? '#4caf50' : '#f44336',
                                  fontWeight: 'bold'
                                }}
                              >
                                {getTotalProfit(stat.profitLossByNumber) > 0 ? '+' : ''}{getTotalProfit(stat.profitLossByNumber)}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Detailed Table */}
                          <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 2 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ backgroundColor: '#495057', color: 'white', fontWeight: 'bold' }}>Number</TableCell>
                                  <TableCell align="right" sx={{ backgroundColor: '#495057', color: 'white', fontWeight: 'bold' }}>Bet Amount</TableCell>
                                  <TableCell align="right" sx={{ backgroundColor: '#495057', color: 'white', fontWeight: 'bold' }}>Payout</TableCell>
                                  <TableCell align="right" sx={{ backgroundColor: '#495057', color: 'white', fontWeight: 'bold' }}>Profit/Loss</TableCell>
                                  <TableCell sx={{ backgroundColor: '#495057', color: 'white', fontWeight: 'bold' }}>Available Colors</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Object.entries(stat.profitLossByNumber).map(([number, data]) => (
                                  <TableRow 
                                    key={number} 
                                    sx={{ 
                                      backgroundColor: data.profit < 0 ? '#ffebee' : data.profit > 0 ? '#e8f5e8' : 'inherit',
                                      '&:hover': { backgroundColor: data.profit < 0 ? '#ffcdd2' : data.profit > 0 ? '#c8e6c9' : '#f5f5f5' }
                                    }}
                                  >
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{number}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                      {stat.totalByNumber && stat.totalByNumber[number] ? stat.totalByNumber[number] : 0}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                                      {data.payout}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        sx={{
                                          color: data.profit >= 0 ? '#4caf50' : '#f44336',
                                          fontWeight: 'bold',
                                          fontSize: '0.9rem'
                                        }}
                                      >
                                        {data.profit > 0 ? '+' : ''}{data.profit}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box className="flex gap-1 flex-wrap">
                                        {data.colors.map((color, idx) => (
                                          <Chip
                                            key={idx}
                                            label={color}
                                            size="small"
                                            sx={{
                                              backgroundColor: getColorForChip(color),
                                              color: 'white',
                                              fontSize: '0.7rem',
                                              fontWeight: 'bold'
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          {/* Size Distribution with More Details */}
                          {stat.totalBySize && (
                            <Box className="mt-4" sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                              <Typography variant="subtitle1" className="mb-3" sx={{ fontWeight: 600, color: '#495057' }}>
                                Size Distribution Analysis
                              </Typography>
                              <Box className="flex gap-4 items-center">
                                <Box className="flex items-center gap-2">
                                  <Chip 
                                    label={`Big: ${stat.totalBySize.big}`} 
                                    sx={{ backgroundColor: '#607d8b', color: 'white', fontWeight: 'bold' }}
                                  />
                                  <Typography variant="body2" color="textSecondary">
                                    ({stat.totalBySize.big > 0 ? ((stat.totalBySize.big / (stat.totalBySize.big + stat.totalBySize.small)) * 100).toFixed(1) : '0'}%)
                                  </Typography>
                                </Box>
                                <Box className="flex items-center gap-2">
                                  <Chip 
                                    label={`Small: ${stat.totalBySize.small}`} 
                                    sx={{ backgroundColor: '#795548', color: 'white', fontWeight: 'bold' }}
                                  />
                                  <Typography variant="body2" color="textSecondary">
                                    ({stat.totalBySize.small > 0 ? ((stat.totalBySize.small / (stat.totalBySize.big + stat.totalBySize.small)) * 100).toFixed(1) : '0'}%)
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {error ? 'Failed to load game stats' : 'No game statistics found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Set Winner Modal */}
      <Dialog 
        open={setWinnerModal} 
        onClose={closeSetWinnerModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1f1f1f', color: 'white' }}>
          <Box className="flex items-center gap-2">
            <EmojiEvents />
            Set Winner for Game
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box className="space-y-4">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Game Period:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'monospace', 
                  backgroundColor: '#f5f5f5', 
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '0.9rem'
                }}
              >
                {formatPeriod(selectedGamePeriod)}
              </Typography>
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Winning Number</InputLabel>
              <Select
                value={selectedWinningNumber}
                label="Winning Number"
                onChange={(e) => setSelectedWinningNumber(Number(e.target.value))}
                disabled={settingWinner}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <MenuItem key={num} value={num}>
                    <Box className="flex items-center gap-2">
                      <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {num}
                      </Typography>
                      <Box className="flex gap-1">
                        {/* Show colors for each number */}
                        {num === 0 && (
                          <>
                            <Chip label="Red" size="small" sx={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.6rem' }} />
                            <Chip label="Violet" size="small" sx={{ backgroundColor: '#9c27b0', color: 'white', fontSize: '0.6rem' }} />
                          </>
                        )}
                        {num === 5 && (
                          <>
                            <Chip label="Green" size="small" sx={{ backgroundColor: '#4caf50', color: 'white', fontSize: '0.6rem' }} />
                            <Chip label="Violet" size="small" sx={{ backgroundColor: '#9c27b0', color: 'white', fontSize: '0.6rem' }} />
                          </>
                        )}
                        {(num === 1 || num === 3 || num === 7 || num === 9) && (
                          <Chip label="Green" size="small" sx={{ backgroundColor: '#4caf50', color: 'white', fontSize: '0.6rem' }} />
                        )}
                        {(num === 2 || num === 4 || num === 6 || num === 8) && (
                          <Chip label="Red" size="small" sx={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedWinningNumber >= 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Selected:</strong> Number {selectedWinningNumber} for period {formatPeriod(selectedGamePeriod)}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={closeSetWinnerModal} 
            disabled={settingWinner}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSetWinner} 
            disabled={settingWinner || selectedWinningNumber < 0}
            variant="contained"
            sx={{ 
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c'
              }
            }}
            startIcon={settingWinner ? <CircularProgress size={16} /> : <EmojiEvents />}
          >
            {settingWinner ? 'Setting Winner...' : 'Set Winner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper function for color chips
function getColorForChip(color: string): string {
  const colors: Record<string, string> = {
    'Red': '#f44336',
    'Green': '#4caf50',
    'Violet': '#9c27b0',
  };
  return colors[color] || '#607d8b';
}