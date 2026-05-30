import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../../lib/axios.js";
import { LOCATION_DATA } from "../../../../lib/locationData.js";

const MunicipalityPage = ({ data: propData, area: propArea }) => {
  const { districtSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [showWaterRequests, setShowWaterRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  const isEmbedded = propData !== undefined && propArea !== undefined;

  const districtName = isEmbedded
    ? propArea
    : Object.keys(LOCATION_DATA["West Bengal"] || {}).find(
        (d) =>
          d.toLowerCase().replace(/\s+/g, "-") === districtSlug ||
          encodeURIComponent(d) === districtSlug ||
          d === districtSlug
      ) || districtSlug;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    setAdminUser(user);
  }, []);

  useEffect(() => {
    if (isEmbedded) {
      setData(propData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/properties/district/${encodeURIComponent(districtName)}/get-dashboard-content`
        );
        setData(res.data.data || []);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    if (districtName) fetchData();
  }, [districtName, isEmbedded, propData]);

  const fetchPendingRequests = async () => {
    try {
      setRequestsLoading(true);
      const adminUserData = JSON.parse(localStorage.getItem("adminUser"));
      const municipality = adminUserData?.municipality;

      if (!municipality) return;

      const response = await axiosInstance.get(`/water-requests/pending?municipality=${encodeURIComponent(municipality)}`);

      if (response.data.success) {
        setPendingRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (showWaterRequests) {
      fetchPendingRequests();
    }
  }, [showWaterRequests]);

  const viewRequestDetails = async (requestId) => {
    try {
      const response = await axiosInstance.get(`/water-requests/${requestId}`);
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
      const response = await axiosInstance.put(`/water-requests/${requestId}/approve`);

      if (response.data.success) {
        setPendingRequests(pendingRequests.filter(r => r.requestId !== requestId));
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
      const response = await axiosInstance.put(`/water-requests/${requestId}/reject`, {});

      if (response.data.success) {
        setPendingRequests(pendingRequests.filter(r => r.requestId !== requestId));
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

  const filtered = data.filter((item) =>
    item.municipality.toLowerCase().includes(search.toLowerCase())
  );

  const isMunicipalityAdmin = adminUser?.adminLevel === "municipality";

  if (isEmbedded) {
    return (
      <div className="px-8 py-8">
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 mb-1 select-none">
            System Overview
          </p>
          <h2 className="text-2xl font-bold tracking-wide text-slate-700">
            Municipalities in <span className="text-cyan-600/80">{districtName}</span>
          </h2>
        </div>

        <div className="mb-6 max-w-xs">
          <input
            type="text"
            placeholder="Search municipality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs tracking-wide rounded
              bg-white/40 backdrop-blur-md border border-slate-300/60
              text-slate-600 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-400/40
              shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item, index) => {
            const hasAdmin = !!item.adminName;
            return (
              <div
                key={index}
                title={!hasAdmin ? "No admin assigned — cannot view details" : undefined}
                className={`relative bg-white/60 backdrop-blur-sm border rounded p-5 shadow-sm transition-all duration-200
                  ${hasAdmin
                    ? "border-slate-200 hover:shadow-md hover:border-slate-400"
                    : "border-slate-200/50 opacity-50 cursor-not-allowed select-none"
                  }`}
              >
                <div className="flex flex-col h-full justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">
                      Municipality
                    </span>
                    <h3 className={`font-semibold text-sm ${hasAdmin ? "text-slate-700" : "text-slate-400"}`}>
                      {item.municipality}
                    </h3>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block mb-1">
                      Administrator
                    </span>
                    {hasAdmin ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <p className="text-xs font-medium text-slate-600 truncate">{item.adminName}</p>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 tracking-wider pl-3.5 truncate">
                          {item.adminKey}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        <p className="text-[10px] italic text-rose-400 font-medium">No Admin Assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-200">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-slate-300/50 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-2xl" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-slate-400/20"
            style={{
              width: `${30 + i * 18}%`,
              height: `${18 + i * 10}%`,
              animation: `ripple ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-slate-300/40 bg-white/20 backdrop-blur-sm">
        <h1 className="text-lg font-semibold tracking-[0.3em] text-slate-700 select-none">
          HYDRAONE
        </h1>
        <div className="flex items-center gap-6">
          {adminUser?.name && (
            <span className="text-xs tracking-widest text-slate-500 uppercase select-none hidden sm:block">
              {adminUser.name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600
              text-slate-100 text-xs tracking-widest font-medium
              rounded transition-all duration-200
              shadow-md shadow-slate-500/30
              hover:shadow-lg hover:shadow-slate-500/40
              active:translate-y-px
              focus:outline-none focus:ring-2 focus:ring-slate-400/50"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-8 py-8">
        {!isMunicipalityAdmin && (
          <button
            onClick={() => navigate(-1)}
            className="self-start mb-6 flex items-center gap-2 text-[10px] tracking-widest uppercase text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            ← Back to Districts
          </button>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-wide text-slate-700">
            Municipalities in <span className="text-slate-500">{districtName}</span>
          </h2>

          {isMunicipalityAdmin && (
            <button
              onClick={() => setShowWaterRequests(!showWaterRequests)}
              className={`px-4 py-2 rounded text-xs font-medium transition-all duration-200 ${
                showWaterRequests
                  ? "bg-slate-700 text-white"
                  : "bg-white/60 backdrop-blur-sm border border-slate-300/60 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {showWaterRequests ? "Hide Water Requests" : "View Pending Water Requests"}
            </button>
          )}
        </div>

        <div className="mb-6 max-w-xs">
          <input
            type="text"
            placeholder="Search municipality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs tracking-wide rounded
              bg-white/40 backdrop-blur-md border border-slate-300/60
              text-slate-600 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-400/40
              shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>

        {showWaterRequests && isMunicipalityAdmin && (
          <div className="mb-8 rounded-xl border border-slate-300/60 bg-white/60 backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-700">Pending Water Requests</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Requests awaiting your approval</p>
            </div>
            <div className="divide-y divide-slate-200">
              {requestsLoading ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">Loading requests...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">No pending requests</div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.requestId} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{req.propertyDetails.propertyName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.requestId}</p>
                        <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                          <span>Water ID: {req.waterId}</span>
                          <span>Slot: {req.slot === 8 ? "8 AM" : req.slot === 12 ? "12 PM" : "3 PM"}</span>
                          <span>Guests: {req.invitedGuests?.length || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => viewRequestDetails(req.requestId)}
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
            <p className="text-sm tracking-widest uppercase text-slate-400 animate-pulse">
              Loading...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] tracking-[0.35em] uppercase text-slate-400 select-none">
              No Municipalities Found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item, index) => {
              const hasAdmin = !!item.adminName;
              return (
                <div
                  key={index}
                  onClick={
                    hasAdmin
                      ? () => navigate(`/municipality/${encodeURIComponent(item.municipality)}`)
                      : undefined
                  }
                  title={!hasAdmin ? "No admin assigned — cannot view details" : undefined}
                  className={`group relative bg-white/60 backdrop-blur-sm border rounded p-5 shadow-sm transition-all duration-200
                    ${hasAdmin
                      ? "border-slate-200 cursor-pointer hover:border-slate-400 hover:shadow-md"
                      : "border-slate-200/50 cursor-not-allowed opacity-70 select-none"
                    }`}
                >
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">
                        Municipality
                      </span>
                      <h3 className={`font-semibold text-sm transition-colors ${hasAdmin ? "text-slate-700 group-hover:text-blue-600" : "text-slate-400"}`}>
                        {item.municipality}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block mb-1">
                        Administrator
                      </span>
                      {hasAdmin ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <p className="text-xs font-medium text-slate-600 truncate">{item.adminName}</p>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 tracking-wider pl-3.5 truncate">
                            {item.adminKey}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <p className="text-[10px] italic text-rose-400 font-medium">No Admin Assigned</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {hasAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Request Information</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Request ID:</span>
                    <p className="font-mono text-slate-700">{selectedRequest.requestId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Water ID:</span>
                    <p className="font-mono text-slate-700">{selectedRequest.waterId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Submitted:</span>
                    <p className="text-slate-700">{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Slot:</span>
                    <p className="text-slate-700 font-medium">
                      {selectedRequest.slot === 8 ? "8:00 AM" : selectedRequest.slot === 12 ? "12:00 PM" : "3:00 PM"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Property Details</p>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-400">Name:</span> {selectedRequest.propertyDetails?.propertyName}</div>
                  <div><span className="text-slate-400">Address:</span> {selectedRequest.propertyDetails?.municipality}, {selectedRequest.propertyDetails?.district}, {selectedRequest.propertyDetails?.state}</div>
                  <div><span className="text-slate-400">Ward:</span> {selectedRequest.propertyDetails?.wardNumber}</div>
                  <div><span className="text-slate-400">Property ID:</span> {selectedRequest.propertyDetails?.propertyId}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Resident</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
                    <span className="text-slate-600 font-bold text-lg">
                      {selectedRequest.userName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{selectedRequest.userName}</p>
                    <p className="text-xs text-slate-400">{selectedRequest.userEmail}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.primaryMembers && selectedRequest.primaryMembers.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Primary Members ({selectedRequest.primaryMembers.length})</p>
                  <div className="space-y-2">
                    {selectedRequest.primaryMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                          {member.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-700">{member.userName}</span>
                        <span className="text-xs text-slate-400">({member.userId})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.invitedGuests && selectedRequest.invitedGuests.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Invited Guests ({selectedRequest.invitedGuests.length})</p>
                  <div className="space-y-3">
                    {selectedRequest.invitedGuests.map((guest, idx) => (
                      <div key={idx} className="border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{guest.userName}</p>
                            <p className="text-xs text-slate-400">{guest.userId}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-slate-600">Arrival: {guest.arrivalTime}</p>
                            <p className="text-slate-600">Duration: {guest.stayDuration} hrs</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-amber-50 rounded-lg p-4 border border-amber-200">
                <span className="text-sm font-medium text-amber-700">Extra Water Requested:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedRequest.extraWaterRequested ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {selectedRequest.extraWaterRequested ? "YES" : "NO"}
                </span>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveRequest(selectedRequest.requestId)}
                    disabled={processingAction !== null}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {processingAction === "approve" ? "Sending notification..." : "Approve Request"}
                  </button>
                  <button
                    onClick={() => rejectRequest(selectedRequest.requestId)}
                    disabled={processingAction !== null}
                    className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {processingAction === "reject" ? "Sending notification..." : "Reject Request"}
                  </button>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className={`rounded-lg p-4 text-center ${selectedRequest.status === 'approved' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  <p className="font-medium">
                    {selectedRequest.status === 'approved' ? "✓ Request Approved" : "✗ Request Rejected"}
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
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">
          © 2025 HydraOne · Admin Access Only
        </p>
      </footer>

      <style>{`
        @keyframes ripple {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MunicipalityPage;