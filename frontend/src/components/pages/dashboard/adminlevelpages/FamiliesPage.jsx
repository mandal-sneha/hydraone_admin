import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../../lib/axios.js";

const FamiliesPage = () => {
  const { municipalitySlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [waterRequests, setWaterRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  const municipalityName = decodeURIComponent(municipalitySlug || "");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    setAdminUser(user);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/properties/municipality/${encodeURIComponent(municipalityName)}/get-dashboard-content`
        );
        setData(res.data.data || []);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    if (municipalityName) fetchData();
  }, [municipalityName]);

  const fetchWaterRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axiosInstance.get(`/water-requests/pending?municipality=${encodeURIComponent(municipalityName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWaterRequests(response.data.data);
      } else {
        setWaterRequests([]);
      }
    } catch (error) {
      console.error("Error fetching water requests:", error);
      setWaterRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const toggleRequests = async () => {
    if (!showRequests) {
      await fetchWaterRequests();
      setShowRequests(true);
    } else {
      setShowRequests(false);
    }
  };

  const viewRequestDetails = async (request) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axiosInstance.get(`/water-requests/${request._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedRequest(response.data.data);
        setShowRequestModal(true);
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      setProcessingAction("approve");
      const token = localStorage.getItem("adminToken");
      const response = await axiosInstance.put(`/water-requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWaterRequests(prev => prev.filter(r => r._id !== requestId));
        setShowRequestModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setProcessingAction("reject");
      const token = localStorage.getItem("adminToken");
      const response = await axiosInstance.put(`/water-requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWaterRequests(prev => prev.filter(r => r._id !== requestId));
        setShowRequestModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  const filtered = data.filter(
    (item) =>
      item.waterId?.toLowerCase().includes(search.toLowerCase()) ||
      item.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.wardNumber)?.includes(search)
  );

  const isMunicipalityAdmin = adminUser?.adminLevel === "municipality";

  const getGuestStatusBadge = (status) => {
    if (status === 'accepted') return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Accepted</span>;
    if (status === 'declined') return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Declined</span>;
    if (status === 'arrived') return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Arrived</span>;
    return <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>;
  };

  const slotLabels = { 8: "8:00 AM", 12: "12:00 PM", 15: "3:00 PM" };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' at');
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "—";
    const [time, modifier] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    let displayHour = h;
    let displayModifier = modifier;
    
    if (!modifier) {
      displayModifier = h >= 12 ? "PM" : "AM";
      displayHour = h % 12 === 0 ? 12 : h % 12;
    }
    
    return `${displayHour}:${String(m).padStart(2, "0")} ${displayModifier}`;
  };

  const addHours = (timeStr, hours) => {
    if (!timeStr || !hours) return "—";
    const [time, modifier] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    
    if (modifier === "PM" && h !== 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;
    
    let totalHours = h + parseInt(hours);
    let newHour = totalHours % 24;
    let newModifier = newHour >= 12 ? "PM" : "AM";
    newHour = newHour % 12;
    if (newHour === 0) newHour = 12;
    
    return `${newHour}:${String(m).padStart(2, "0")} ${newModifier}`;
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-200">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-slate-300/50 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-2xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-slate-300/40 bg-white/20 backdrop-blur-sm">
        <h1 className="text-lg font-semibold tracking-[0.3em] text-slate-700 select-none">HYDRAONE</h1>
        <div className="flex items-center gap-6">
          {adminUser?.name && (
            <span className="text-xs tracking-widest text-slate-500 uppercase select-none hidden sm:block">
              {adminUser.name}
            </span>
          )}
          <button onClick={handleLogout} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs tracking-widest font-medium rounded transition-all duration-200 shadow-md shadow-slate-500/30 hover:shadow-lg hover:shadow-slate-500/40 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-slate-400/50">
            Log Out
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-8 py-8">
        {!isMunicipalityAdmin && (
          <button onClick={() => navigate(-1)} className="self-start mb-6 flex items-center gap-2 text-[10px] tracking-widest uppercase text-slate-400 hover:text-slate-600 transition-colors duration-200">
            ← Back to Municipalities
          </button>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-wide text-slate-700">
            Families in <span className="text-slate-500">{municipalityName}</span>
          </h2>

          {isMunicipalityAdmin && (
            <button
              onClick={toggleRequests}
              className="px-4 py-2 rounded text-xs font-medium transition-all duration-200 bg-white/60 backdrop-blur-sm border border-slate-300/60 text-slate-600 hover:bg-slate-100"
            >
              {showRequests ? "Hide Water Requests" : `View Water Requests (${waterRequests.length})`}
            </button>
          )}
        </div>

        <div className="mb-6 max-w-xs">
          <input type="text" placeholder="Search by water ID, property or ward..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs tracking-wide rounded bg-white/40 backdrop-blur-md border border-slate-300/60 text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40 shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>

        {showRequests && isMunicipalityAdmin && (
          <div className="mb-8 rounded-xl border border-slate-300/60 bg-white/60 backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-700">Pending Water Registration Requests</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Requests awaiting your approval</p>
            </div>
            <div className="divide-y divide-slate-200">
              {requestsLoading ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">Loading requests...</div>
              ) : waterRequests.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">No pending requests</div>
              ) : (
                waterRequests.map((req) => (
                  <div key={req._id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-slate-700">{req.propertyName}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            {req.slot === 8 ? "8 AM" : req.slot === 12 ? "12 PM" : "3 PM"}
                          </span>
                          {req.extraWaterRequested && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Extra Water</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Water ID: {req.waterId}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-[10px] text-slate-500">Ward: {req.wardNumber}</span>
                          <span className="text-[10px] text-slate-500">Submitted: {formatDate(req.submittedAt)}</span>
                          <span className="text-[10px] text-slate-500 font-semibold text-blue-600">Guests: {req.invitedGuests?.length || 0}</span>
                        </div>
                        {req.invitedGuests && req.invitedGuests.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {req.invitedGuests.map((guest, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-[9px]">
                                <span className="text-slate-600">{guest.userName}</span>
                                {getGuestStatusBadge(guest.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => viewRequestDetails(req)}
                        className="px-3 py-1.5 text-[10px] font-medium rounded bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm tracking-widest uppercase text-slate-400 animate-pulse">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] tracking-[0.35em] uppercase text-slate-400 select-none">No Families Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item, index) => (
              <div key={index} onClick={() => navigate(`/house/${item.waterId}`)}
                className="group relative bg-white/60 backdrop-blur-sm border border-slate-200 rounded p-5 cursor-pointer hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex flex-col h-full justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">Water ID</span>
                    <h3 className="text-slate-700 font-mono font-semibold text-sm group-hover:text-blue-600 transition-colors truncate">{item.waterId}</h3>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                    <div>
                      <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block">Property</span>
                      <p className="text-xs text-slate-600 font-medium truncate">{item.propertyName || "—"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block">Ward</span>
                      <p className="text-xs text-slate-600 font-medium">Ward {item.wardNumber ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Water Request Details</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Property Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-400">Property:</span> <span className="text-slate-700 font-medium">{selectedRequest.propertyDetails?.propertyName || selectedRequest.propertyName || "—"}</span></div>
                  <div><span className="text-slate-400">Water ID:</span> <span className="text-slate-700 font-mono text-xs">{selectedRequest.waterId || "—"}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">Address:</span> <span className="text-slate-700">{selectedRequest.propertyDetails?.municipality || selectedRequest.municipality || "—"}, {selectedRequest.propertyDetails?.district || selectedRequest.district || "—"}</span></div>
                  <div><span className="text-slate-400">Ward:</span> <span className="text-slate-700">{selectedRequest.propertyDetails?.wardNumber || selectedRequest.wardNumber || "—"}</span></div>
                  <div><span className="text-slate-400">Slot:</span> <span className="text-slate-700 font-medium">{slotLabels[selectedRequest.slot]}</span></div>
                  <div><span className="text-slate-400">Extra Water:</span> <span className="text-slate-700">{selectedRequest.extraWaterRequested ? "Yes" : "No"}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">Submitted:</span> <span className="text-slate-700">{formatDate(selectedRequest.submittedAt)}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Primary Members ({selectedRequest.primaryMembers?.length || 0})</h4>
                <div className="space-y-2">
                  {selectedRequest.primaryMembers?.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <img src={member.userProfilePhoto || "https://via.placeholder.com/32"} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-slate-700">{member.userName}</p>
                        <p className="text-xs text-slate-400">{member.userId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">Invited Guests ({selectedRequest.invitedGuests?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedRequest.invitedGuests?.length === 0 ? (
                    <p className="text-sm text-slate-400">No guests invited</p>
                  ) : (
                    selectedRequest.invitedGuests?.map((guest, idx) => (
                      <div key={idx} className="border-b border-slate-200 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={guest.userProfilePhoto || "https://via.placeholder.com/32"} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="font-medium text-slate-700">{guest.userName}</p>
                              <p className="text-xs text-slate-400">{guest.userId}</p>
                            </div>
                          </div>
                          {getGuestStatusBadge(guest.status)}
                        </div>
                        {guest.arrivalTime && (
                          <div className="mt-2 text-xs text-slate-500 ml-11">
                            Arrives: {formatTimeDisplay(guest.arrivalTime)} • 
                            Leaves: {addHours(guest.arrivalTime, guest.stayDuration)} • 
                            Duration: {guest.stayDuration} hours
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveRequest(selectedRequest._id)}
                    disabled={processingAction !== null}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {processingAction === "approve" ? "Sending notification..." : "Approve & Allocate Water"}
                  </button>
                  <button
                    onClick={() => rejectRequest(selectedRequest._id)}
                    disabled={processingAction !== null}
                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {processingAction === "reject" ? "Sending notification..." : "Reject Request"}
                  </button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className={`rounded-lg p-4 text-center ${selectedRequest.status === 'approved' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  <p className="font-medium">
                    {selectedRequest.status === 'approved' ? "✓ Request Approved - Water Allocated" : "✗ Request Rejected"}
                  </p>
                  {selectedRequest.rejectionReason && (
                    <p className="text-sm mt-1">Reason: {selectedRequest.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 py-4 border-t border-slate-300/40 text-center bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">© 2025 HydraOne · Admin Access Only</p>
      </footer>
    </div>
  );
};

export default FamiliesPage;