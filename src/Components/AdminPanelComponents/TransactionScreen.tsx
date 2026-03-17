// 'use client';

// import { useState } from 'react';
// import {
//   TextField,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   Box,
// } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';
// import { ArrowForward } from '@mui/icons-material';

// const transactions = [
//   { username: 'John Doe', userid: 'U12345', transactionId: 'T98765', amount: '$150.00', mode: 'Credit Card', status: 'Success' },
//   { username: 'Jane Smith', userid: 'U67890', transactionId: 'T12345', amount: '$200.00', mode: 'PayPal', status: 'Pending' },
//   { username: 'Alex Johnson', userid: 'U54321', transactionId: 'T67890', amount: '$350.00', mode: 'Bank Transfer', status: 'Failed' },
//   { username: 'Michael Brown', userid: 'U11111', transactionId: 'T33333', amount: '$500.00', mode: 'Debit Card', status: 'Success' },
//   { username: 'Emily White', userid: 'U22222', transactionId: 'T44444', amount: '$100.00', mode: 'UPI', status: 'Pending' },
//   { username: 'David Green', userid: 'U33333', transactionId: 'T55555', amount: '$750.00', mode: 'Net Banking', status: 'Success' },
//   { username: 'Sophia Wilson', userid: 'U44444', transactionId: 'T66666', amount: '$450.00', mode: 'Wallet', status: 'Failed' },
// ];

// export default function TransactionTable() {
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOrder, setSortOrder] = useState('default');
//   const [selectedMode, setSelectedMode] = useState('All');

//   const paymentModes = ['All', ...new Set(transactions.map((txn) => txn.mode))];

//   const filteredTransactions = transactions.filter(
//     (txn) =>
//       (selectedMode === 'All' || txn.mode === selectedMode) &&
//       (txn.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         txn.amount.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   if (sortOrder === 'username-asc') {
//     filteredTransactions.sort((a, b) => a.username.localeCompare(b.username));
//   } else if (sortOrder === 'username-desc') {
//     filteredTransactions.sort((a, b) => b.username.localeCompare(a.username));
//   } else if (sortOrder === 'amount-low-high') {
//     filteredTransactions.sort((a, b) => parseFloat(a.amount.slice(1)) - parseFloat(b.amount.slice(1)));
//   } else if (sortOrder === 'amount-high-low') {
//     filteredTransactions.sort((a, b) => parseFloat(b.amount.slice(1)) - parseFloat(a.amount.slice(1)));
//   }

//   const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const displayedTransactions = filteredTransactions.slice(startIndex, startIndex + entriesPerPage);

//   return (
//     <Box sx={{ color: 'black', mt: 3 }}>
//       {/* Controls */}
//       <Box
//         sx={{
//           display: 'flex',
//           flexWrap: 'wrap',
//           gap: 2,
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           mb: 3,
//         }}
//       >
//         <TextField
//           variant="outlined"
//           size="small"
//           label="Search"
//           value={searchQuery}
//           onChange={(e) => {
//             setSearchQuery(e.target.value);
//             setCurrentPage(1);
//           }}
//           sx={{ minWidth: 250 }}
//         />

//         <FormControl size="small" sx={{ minWidth: 120 }}>
//           <InputLabel>Entries</InputLabel>
//           <Select
//             value={entriesPerPage}
//             label="Entries"
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             {[3, 5, 10].map((num) => (
//               <MenuItem key={num} value={num}>
//                 {num}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl size="small" sx={{ minWidth: 160 }}>
//           <InputLabel>Sort</InputLabel>
//           <Select
//             value={sortOrder}
//             label="Sort"
//             onChange={(e) => setSortOrder(e.target.value)}
//           >
//             <MenuItem value="default">Default</MenuItem>
//             <MenuItem value="username-asc">Username (A-Z)</MenuItem>
//             <MenuItem value="username-desc">Username (Z-A)</MenuItem>
//             <MenuItem value="amount-low-high">Amount ↑</MenuItem>
//             <MenuItem value="amount-high-low">Amount ↓</MenuItem>
//           </Select>
//         </FormControl>

//         <FormControl size="small" sx={{ minWidth: 160 }}>
//           <InputLabel>Payment Mode</InputLabel>
//           <Select
//             value={selectedMode}
//             label="Payment Mode"
//             onChange={(e) => {
//               setSelectedMode(e.target.value);
//               setCurrentPage(1);
//             }}
//           >
//             {paymentModes.map((mode, index) => (
//               <MenuItem key={index} value={mode}>
//                 {mode}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Button
            
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//           >
//             <ArrowBack />
//           </Button>
          
//           <Typography variant="body2">
//             Page {currentPage} of {totalPages}
//           </Typography>
//           <Button
//             variant="outlined"
//             color="success"
//             size="small"
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//           >
//             <ArrowForward />
//           </Button>
          
//         </Box>
//       </Box>

//       {/* Table */}
//       <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
//         <Table>
//           <TableHead sx={{ backgroundColor: "#1f1f1f" }}>
//             <TableRow>
//               <TableCell sx={{ color: '#fff' }}>Username</TableCell>
//               <TableCell sx={{ color: '#fff' }}>User ID</TableCell>
//               <TableCell sx={{ color: '#fff' }}>Transaction ID</TableCell>
//               <TableCell sx={{ color: '#fff' }}>Amount</TableCell>
//               <TableCell sx={{ color: '#fff' }}>Mode</TableCell>
//               <TableCell sx={{ color: '#fff' }}>Status</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {displayedTransactions.length > 0 ? (
//               displayedTransactions.map((txn, index) => (
//                 <TableRow key={index} hover>
//                   <TableCell>{txn.username}</TableCell>
//                   <TableCell>{txn.userid}</TableCell>
//                   <TableCell>{txn.transactionId}</TableCell>
//                   <TableCell sx={{ fontWeight: 600 }}>{txn.amount}</TableCell>
//                   <TableCell>{txn.mode}</TableCell>
//                   <TableCell
//                     sx={{
//                       fontWeight: 600,
//                       color:
//                         txn.status === 'Success'
//                           ? '#15803d'
//                           : txn.status === 'Pending'
//                           ? '#d97706'
//                           : '#b91c1c',
//                     }}
//                   >
//                     {txn.status}
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={6} align="center">
//                   No transactions found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// }


  // interface TransactionFromAPI {
  //   _id: string;
  //   userId: string;
  //   type: 'credit' | 'debit';
  //   amount: number;
  //   status: string;
  //   transactionId: string;
  //   createdAt: string;
  //   updatedAt: string;
  //   betType?: string | null;
  //   betValue?: string[];
  // }
  // 'use client';

  // import { useState, useEffect } from 'react';
  // import {
  //   TextField,
  //   MenuItem,
  //   Select,
  //   InputLabel,
  //   FormControl,
  //   Button,
  //   Table,
  //   TableBody,
  //   TableCell,
  //   TableContainer,
  //   TableHead,
  //   TableRow,
  //   Paper,
  //   Typography,
  //   Box,
  // } from '@mui/material';
  // import { ArrowBack, ArrowForward } from '@mui/icons-material';

  // export default function TransactionTable() {

    
    
  // const [transactions, setTransactions] = useState<TransactionFromAPI[]>([]);
  //   const [loading, setLoading] = useState(true);

  //   const [entriesPerPage, setEntriesPerPage] = useState(5);
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [searchQuery, setSearchQuery] = useState('');
  //   const [sortOrder, setSortOrder] = useState('default');
  //   const [selectedMode, setSelectedMode] = useState('All');

  //   // Fetch data using fetch()
  //   useEffect(() => {
  //   const fetchTransactions = async () => {
  //     try {
  //       const token = localStorage.getItem('token'); // or whatever key you use

  //       const res = await fetch('https://ctbackend.crobstacle.com/api/wallet/transactions', {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`, // include token in Authorization header
  //         },
  //       });

  //       const json = await res.json();
  //       setTransactions(json.data || []);
  //     } catch (error) {
  //       console.error('Error fetching transactions:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTransactions();
  // }, []);

  //   // Map API format to UI table format
  //   const transformedTransactions = transactions.map((txn) => ({
  //     username: 'User', // Placeholder - replace if you fetch usernames
  //     userid: txn.userId,
  //     transactionId: txn.transactionId,
  //     amount: `₹${txn.amount.toFixed(2)}`,
  //     mode: txn.type === 'credit' ? 'Credit' : 'Debit',
  //     status: txn.status === 'completed' ? 'Success' : 'Pending',
  //   }));

  //   const paymentModes = ['All', ...new Set(transformedTransactions.map((txn) => txn.mode))];

  //   const filteredTransactions = transformedTransactions.filter(
  //     (txn) =>
  //       (selectedMode === 'All' || txn.mode === selectedMode) &&
  //       (txn.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         txn.amount.toLowerCase().includes(searchQuery.toLowerCase()))
  //   );

  //   // Sorting
  //   if (sortOrder === 'username-asc') {
  //     filteredTransactions.sort((a, b) => a.username.localeCompare(b.username));
  //   } else if (sortOrder === 'username-desc') {
  //     filteredTransactions.sort((a, b) => b.username.localeCompare(a.username));
  //   } else if (sortOrder === 'amount-low-high') {
  //     filteredTransactions.sort((a, b) => parseFloat(a.amount.slice(1)) - parseFloat(b.amount.slice(1)));
  //   } else if (sortOrder === 'amount-high-low') {
  //     filteredTransactions.sort((a, b) => parseFloat(b.amount.slice(1)) - parseFloat(a.amount.slice(1)));
  //   }

  //   const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
  //   const startIndex = (currentPage - 1) * entriesPerPage;
  //   const displayedTransactions = filteredTransactions.slice(startIndex, startIndex + entriesPerPage);

  //   if (loading) {
  //     return <Typography>Loading transactions...</Typography>;
  //   }

  //   return (
  //     <Box sx={{ color: 'black', mt: 3 }}>
  //       {/* Controls */}
  //       <Box
  //         sx={{
  //           display: 'flex',
  //           flexWrap: 'wrap',
  //           gap: 2,
  //           justifyContent: 'space-between',
  //           alignItems: 'center',
  //           mb: 3,
  //         }}
  //       >
  //         <TextField
  //           variant="outlined"
  //           size="small"
  //           label="Search"
  //           value={searchQuery}
  //           onChange={(e) => {
  //             setSearchQuery(e.target.value);
  //             setCurrentPage(1);
  //           }}
  //           sx={{ minWidth: 250 }}
  //         />

  //         <FormControl size="small" sx={{ minWidth: 120 }}>
  //           <InputLabel>Entries</InputLabel>
  //           <Select
  //             value={entriesPerPage}
  //             label="Entries"
  //             onChange={(e) => {
  //               setEntriesPerPage(Number(e.target.value));
  //               setCurrentPage(1);
  //             }}
  //           >
  //             {[3, 5, 10].map((num) => (
  //               <MenuItem key={num} value={num}>
  //                 {num}
  //               </MenuItem>
  //             ))}
  //           </Select>
  //         </FormControl>

  //         <FormControl size="small" sx={{ minWidth: 160 }}>
  //           <InputLabel>Sort</InputLabel>
  //           <Select value={sortOrder} label="Sort" onChange={(e) => setSortOrder(e.target.value)}>
  //             <MenuItem value="default">Default</MenuItem>
  //             <MenuItem value="username-asc">Username (A-Z)</MenuItem>
  //             <MenuItem value="username-desc">Username (Z-A)</MenuItem>
  //             <MenuItem value="amount-low-high">Amount ↑</MenuItem>
  //             <MenuItem value="amount-high-low">Amount ↓</MenuItem>
  //           </Select>
  //         </FormControl>

  //         <FormControl size="small" sx={{ minWidth: 160 }}>
  //           <InputLabel>Payment Mode</InputLabel>
  //           <Select
  //             value={selectedMode}
  //             label="Payment Mode"
  //             onChange={(e) => {
  //               setSelectedMode(e.target.value);
  //               setCurrentPage(1);
  //             }}
  //           >
  //             {paymentModes.map((mode, index) => (
  //               <MenuItem key={index} value={mode}>
  //                 {mode}
  //               </MenuItem>
  //             ))}
  //           </Select>
  //         </FormControl>

  //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //           <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
  //             <ArrowBack />
  //           </Button>
  //           <Typography variant="body2">
  //             Page {currentPage} of {totalPages}
  //           </Typography>
  //           <Button
  //             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
  //             disabled={currentPage === totalPages}
  //           >
  //             <ArrowForward />
  //           </Button>
  //         </Box>
  //       </Box>

  //       {/* Table */}
  //       <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
  //         <Table>
  //           <TableHead sx={{ backgroundColor: '#1f1f1f' }}>
  //             <TableRow>
  //               <TableCell sx={{ color: '#fff' }}>Username</TableCell>
  //               <TableCell sx={{ color: '#fff' }}>User ID</TableCell>
  //               <TableCell sx={{ color: '#fff' }}>Transaction ID</TableCell>
  //               <TableCell sx={{ color: '#fff' }}>Amount</TableCell>
  //               <TableCell sx={{ color: '#fff' }}>Mode</TableCell>
  //               <TableCell sx={{ color: '#fff' }}>Status</TableCell>
  //             </TableRow>
  //           </TableHead>
  //           <TableBody>
  //             {displayedTransactions.length > 0 ? (
  //               displayedTransactions.map((txn, index) => (
  //                 <TableRow key={index} hover>
  //                   <TableCell>{txn.username}</TableCell>
  //                   <TableCell>{txn.userid}</TableCell>
  //                   <TableCell>{txn.transactionId}</TableCell>
  //                   <TableCell sx={{ fontWeight: 600 }}>{txn.amount}</TableCell>
  //                   <TableCell>{txn.mode}</TableCell>
  //                   <TableCell
  //                     sx={{
  //                       fontWeight: 600,
  //                       color:
  //                         txn.status === 'Success'
  //                           ? '#15803d'
  //                           : txn.status === 'Pending'
  //                           ? '#d97706'
  //                           : '#b91c1c',
  //                     }}
  //                   >
  //                     {txn.status}
  //                   </TableCell>
  //                 </TableRow>
  //               ))
  //             ) : (
  //               <TableRow>
  //                 <TableCell colSpan={6} align="center">
  //                   No transactions found.
  //                 </TableCell>
  //               </TableRow>
  //             )}
  //           </TableBody>
  //         </Table>
  //       </TableContainer>
  //     </Box>
  //   );
  // }

'use client';

type TransactionAPIResponse = {
  status: string;
  statusCode: number;
  message: string;
  data: {
    page: number;
    totalPages: number;
    totalTransactions: number;
    transactions: {
      _id: string;
      userId: {
        _id: string;
        name: string;
        number: {
          value: string;
          verified: boolean;
        };
      };
      type: 'credit' | 'debit';
      amount: number;
      status: string;
      transactionId: string;
      period?: string;
      betType?: string | null;
      betValue?: string[];
      createdAt: string;
      updatedAt: string;
    }[];
  };
};

// Add this type definition for individual transactions
type TransactionFromAPI = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    number: {
      value: string;
      verified: boolean;
    };
  };
  type: 'credit' | 'debit';
  amount: number;
  status: string;
  transactionId: string;
  period?: string;
  betType?: string | null;
  betValue?: string[];
  createdAt: string;
  updatedAt: string;
};



import { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<TransactionFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedMode, setSelectedMode] = useState('All');

  // Fetch data using fetch()
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch('https://ctbackend.crobstacle.com/api/admin/transactions', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json: TransactionAPIResponse = await res.json();

        if (json.status === 'success' && Array.isArray(json.data?.transactions)) {
          setTransactions(json.data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Map API format to UI table format
  const transformedTransactions = transactions.map((txn) => ({
    username: txn.userId?.name || 'N/A',
    userid: txn.userId?._id || 'N/A',
    transactionId: txn.transactionId,
    amount: `₹${txn.amount.toFixed(2)}`,
    mode: txn.type === 'credit' ? 'Credit' : 'Debit',
    status: txn.status === 'completed' ? 'Success' : 'Pending',
  }));

  const paymentModes = ['All', ...new Set(transformedTransactions.map((txn) => txn.mode))];

  const filteredTransactions = transformedTransactions.filter(
    (txn) =>
      (selectedMode === 'All' || txn.mode === selectedMode) &&
      (txn.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.amount.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting
  if (sortOrder === 'username-asc') {
    filteredTransactions.sort((a, b) => a.username.localeCompare(b.username));
  } else if (sortOrder === 'username-desc') {
    filteredTransactions.sort((a, b) => b.username.localeCompare(a.username));
  } else if (sortOrder === 'amount-low-high') {
    filteredTransactions.sort((a, b) => parseFloat(a.amount.slice(1)) - parseFloat(b.amount.slice(1)));
  } else if (sortOrder === 'amount-high-low') {
    filteredTransactions.sort((a, b) => parseFloat(b.amount.slice(1)) - parseFloat(a.amount.slice(1)));
  }

  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedTransactions = filteredTransactions.slice(startIndex, startIndex + entriesPerPage);

  if (loading) {
    return <Typography>Loading transactions...</Typography>;
  }

  return (
    <Box sx={{ color: 'black', mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Entries</InputLabel>
          <Select
            value={entriesPerPage}
            label="Entries"
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[3, 5, 10].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort</InputLabel>
          <Select value={sortOrder} label="Sort" onChange={(e) => setSortOrder(e.target.value)}>
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="username-asc">Username (A-Z)</MenuItem>
            <MenuItem value="username-desc">Username (Z-A)</MenuItem>
            <MenuItem value="amount-low-high">Amount ↑</MenuItem>
            <MenuItem value="amount-high-low">Amount ↓</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Payment Mode</InputLabel>
          <Select
            value={selectedMode}
            label="Payment Mode"
            onChange={(e) => {
              setSelectedMode(e.target.value);
              setCurrentPage(1);
            }}
          >
            {paymentModes.map((mode, index) => (
              <MenuItem key={index} value={mode}>
                {mode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <ArrowBack />
          </Button>
          <Typography variant="body2">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ArrowForward />
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1f1f1f' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Username</TableCell>
              <TableCell sx={{ color: '#fff' }}>User ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Transaction ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Amount</TableCell>
              <TableCell sx={{ color: '#fff' }}>Mode</TableCell>
              <TableCell sx={{ color: '#fff' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((txn, index) => (
                <TableRow key={index} hover>
                  <TableCell>{txn.username}</TableCell>
                  <TableCell>{txn.userid}</TableCell>
                  <TableCell>{txn.transactionId}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{txn.amount}</TableCell>
                  <TableCell>{txn.mode}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color:
                        txn.status === 'Success'
                          ? '#15803d'
                          : txn.status === 'Pending'
                          ? '#d97706'
                          : '#b91c1c',
                    }}
                  >
                    {txn.status}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}