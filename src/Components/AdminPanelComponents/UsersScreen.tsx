// "use client";

// import { useState, useEffect } from "react";
// // import Link from "next/link";
// import {
//   Box,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   Button,
//   Typography,
//   Stack,
//   IconButton,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { ArrowBack, ArrowForward } from "@mui/icons-material";

// // ----------------------
// // ✅ Types
// // ----------------------
// type RawUser = {
//   _id: string;
//   name: string;
//   email?: string;
//   number?: {
//     value: string;
//     verified: boolean;
//   };
// };

// type User = {
//   username: string;
//   userId: string;
//   verified: string;
//   contact: string;
// };

// type ApiResponse = {
//   status: string;
//   statusCode: number;
//   message: string;
//   data: {
//     page: number;
//     totalPages: number;
//     totalUsers: number;
//     users: RawUser[];
//   };
// };

// // ----------------------
// // ✅ Modal Component
// // ----------------------
// const UserDetailsModal = ({
//   open,
//   onClose,
//   user,
// }: {
//   open: boolean;
//   onClose: () => void;
//   user: User | null;
// }) => {
//   if (!user) return null;

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>User Details</DialogTitle>
//       <DialogContent dividers>
//         <Typography><strong>Username:</strong> {user.username}</Typography>
//         <Typography><strong>User ID:</strong> {user.userId}</Typography>
//         <Typography><strong>Verified:</strong> {user.verified}</Typography>
//         <Typography><strong>Contact:</strong> {user.contact}</Typography>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} variant="contained" color="primary">
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // ----------------------
// // ✅ Main Component
// // ----------------------
// export default function UsersTable() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const [entriesPerPage, setEntriesPerPage] = useState<number>(5);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [sortOrder, setSortOrder] = useState<string>("default");

//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [modalOpen, setModalOpen] = useState(false);

//   // ----------------------
//   // ✅ Fetch users
//   // ----------------------
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await fetch("https://ctbackend.crobstacle.com/api/admin/users", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const data: ApiResponse = await res.json();

//         if (data.status === "success" && Array.isArray(data.data?.users)) {
//           const formatted: User[] = data.data.users.map((u) => ({
//             username: u.name || "N/A",
//             userId: u._id,
//             verified: u.number?.verified ? "Yes" : "No",
//             contact: u.number?.value || "N/A",
//           }));
//           setUsers(formatted);
//         }
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // ----------------------
//   // ✅ Filtering, Sorting, Pagination
//   // ----------------------
//   const filteredUsers = users.filter(
//     (user) =>
//       user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.userId.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (sortOrder === "name-asc") {
//     filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
//   } else if (sortOrder === "name-desc") {
//     filteredUsers.sort((a, b) => b.username.localeCompare(a.username));
//   }

//   const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const displayedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage);

//   // ----------------------
//   // ✅ Loading State
//   // ----------------------
//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // ----------------------
//   // ✅ Verified Status Badge
//   // ----------------------
//   const VerificationStatus = ({ status }: { status: string }) => (
//     <Typography
//       sx={{
//         color: status === "Yes" ? "#2196f3" : "#f44336",
//         backgroundColor: status === "Yes" ? "rgba(33, 150, 243, 0.1)" : "rgba(244, 67, 54, 0.1)",
//         padding: "4px 12px",
//         borderRadius: "16px",
//         fontSize: "0.875rem",
//         fontWeight: 500,
//         display: "inline-block",
//       }}
//     >
//       {status}
//     </Typography>
//   );

//   // ----------------------
//   // ✅ Final JSX
//   // ----------------------
//   return (
//     <Box sx={{ width: "100%" }}>
//       {/* Controls */}
//       <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" mb={2}>
//         <TextField
//           label="Search"
//           variant="outlined"
//           size="small"
//           value={searchQuery}
//           onChange={(e) => {
//             setSearchQuery(e.target.value);
//             setCurrentPage(1);
//           }}
//         />

//         <FormControl size="small">
//           <InputLabel>Show</InputLabel>
//           <Select
//             value={entriesPerPage}
//             label="Show"
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             <MenuItem value={3}>3</MenuItem>
//             <MenuItem value={5}>5</MenuItem>
//             <MenuItem value={10}>10</MenuItem>
//           </Select>
//         </FormControl>

//         <FormControl size="small">
//           <InputLabel>Sort</InputLabel>
//           <Select value={sortOrder} label="Sort" onChange={(e) => setSortOrder(e.target.value)}>
//             <MenuItem value="default">Default</MenuItem>
//             <MenuItem value="name-asc">Username (A-Z)</MenuItem>
//             <MenuItem value="name-desc">Username (Z-A)</MenuItem>
//           </Select>
//         </FormControl>

//         {/* Pagination Controls */}
//         <Stack direction="row" alignItems="center" spacing={1}>
//           <IconButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
//             <ArrowBack />
//           </IconButton>
//           <Typography variant="body2">Page {currentPage} of {totalPages}</Typography>
//           <IconButton onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
//             <ArrowForward />
//           </IconButton>
//         </Stack>
//       </Stack>

//       {/* Table */}
//       <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
//         <Table>
//           <TableHead sx={{ bgcolor: "#1f1f1f" }}>
//             <TableRow>
//               <TableCell sx={{ color: "white" }}>Username</TableCell>
//               <TableCell sx={{ color: "white" }}>User ID</TableCell>
//               <TableCell sx={{ color: "white" }}>Verified</TableCell>
//               <TableCell sx={{ color: "white" }}>Contact</TableCell>
//               <TableCell sx={{ color: "white" }}>Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {displayedUsers.length > 0 ? (
//               displayedUsers.map((user, index) => (
//                 <TableRow hover key={index}>
//                   <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
//                   <TableCell>{user.userId}</TableCell>
//                   <TableCell>
//                     <VerificationStatus status={user.verified} />
//                   </TableCell>
//                   <TableCell>{user.contact}</TableCell>
//                   <TableCell>
//                     <Button
//                       variant="contained"
//                       color="success"
//                       size="small"
//                       sx={{
//                         textTransform: "none",
//                         borderRadius: "8px",
//                         boxShadow: "none",
//                         "&:hover": {
//                           boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                         },
//                       }}
//                       onClick={() => {
//                         setSelectedUser(user);
//                         setModalOpen(true);
//                       }}
//                     >
//                       View Details
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
//                   <Typography color="text.secondary">No users found.</Typography>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Modal */}
//       <UserDetailsModal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         user={selectedUser}
//       />
//     </Box>
//   );
// }

"use client";

import { useState, useEffect } from "react";
// import Link from "next/link";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

// ----------------------
// ✅ Types
// ----------------------
type RawUser = {
  _id: string;
  name: string;
  email?: string;
  number?: {
    value: string;
    verified: boolean;
  };
  isActive: boolean; // Added isActive field
};

type User = {
  username: string;
  userId: string;
  verified: string;
  contact: string;
  isActive: string; // Added isActive field
};

type ApiResponse = {
  status: string;
  statusCode: number;
  message: string;
  data: {
    page: number;
    totalPages: number;
    totalUsers: number;
    users: RawUser[];
  };
};

// ----------------------
// ✅ Modal Component
// ----------------------
const UserDetailsModal = ({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User | null;
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User Details</DialogTitle>
      <DialogContent dividers>
        <Typography><strong>Username:</strong> {user.username}</Typography>
        <Typography><strong>User ID:</strong> {user.userId}</Typography>
        <Typography><strong>Verified:</strong> {user.verified}</Typography>
        <Typography><strong>Contact:</strong> {user.contact}</Typography>
        <Typography><strong>Is Active:</strong> {user.isActive}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ----------------------
// ✅ Main Component
// ----------------------
export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [entriesPerPage, setEntriesPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("default");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ----------------------
  // ✅ Fetch users
  // ----------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://ctbackend.crobstacle.com/api/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data: ApiResponse = await res.json();

        if (data.status === "success" && Array.isArray(data.data?.users)) {
          const formatted: User[] = data.data.users.map((u) => ({
            username: u.name || "N/A",
            userId: u._id,
            verified: u.number?.verified ? "Yes" : "No",
            contact: u.number?.value || "N/A",
            isActive: u.isActive ? "Yes" : "No", // Added isActive mapping
          }));
          setUsers(formatted);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ----------------------
  // ✅ Filtering, Sorting, Pagination
  // ----------------------
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortOrder === "name-asc") {
    filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
  } else if (sortOrder === "name-desc") {
    filteredUsers.sort((a, b) => b.username.localeCompare(a.username));
  }

  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage);

  // ----------------------
  // ✅ Loading State
  // ----------------------
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // ----------------------
  // ✅ Status Badge Component (for both Verified and Active status)
  // ----------------------
  const StatusBadge = ({ status }: { status: string }) => (
    <Typography
      sx={{
        color: status === "Yes" ? "#2196f3" : "#f44336",
        backgroundColor: status === "Yes" ? "rgba(33, 150, 243, 0.1)" : "rgba(244, 67, 54, 0.1)",
        padding: "4px 12px",
        borderRadius: "16px",
        fontSize: "0.875rem",
        fontWeight: 500,
        display: "inline-block",
      }}
    >
      {status}
    </Typography>
  );

  // ----------------------
  // ✅ Final JSX
  // ----------------------
  return (
    <Box sx={{ width: "100%" }}>
      {/* Controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" mb={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <FormControl size="small">
          <InputLabel>Show</InputLabel>
          <Select
            value={entriesPerPage}
            label="Show"
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Sort</InputLabel>
          <Select value={sortOrder} label="Sort" onChange={(e) => setSortOrder(e.target.value)}>
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="name-asc">Username (A-Z)</MenuItem>
            <MenuItem value="name-desc">Username (Z-A)</MenuItem>
          </Select>
        </FormControl>

        {/* Pagination Controls */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <ArrowBack />
          </IconButton>
          <Typography variant="body2">Page {currentPage} of {totalPages}</Typography>
          <IconButton onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            <ArrowForward />
          </IconButton>
        </Stack>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#1f1f1f" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Username</TableCell>
              <TableCell sx={{ color: "white" }}>User ID</TableCell>
              <TableCell sx={{ color: "white" }}>Verified</TableCell>
              <TableCell sx={{ color: "white" }}>Is Active</TableCell>
              <TableCell sx={{ color: "white" }}>Contact</TableCell>
              <TableCell sx={{ color: "white" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user, index) => (
                <TableRow hover key={index}>
                  <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.verified} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.isActive} />
                  </TableCell>
                  <TableCell>{user.contact}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                        boxShadow: "none",
                        "&:hover": {
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        },
                      }}
                      onClick={() => {
                        setSelectedUser(user);
                        setModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No users found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <UserDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
      />
    </Box>
  );
}
