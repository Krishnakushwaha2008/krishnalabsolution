import React, { useState } from 'react';
import { Camera } from '../types';
import { api } from '../services/api';
import {
  Cctv,
  Plus,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Square,
  Edit2,
  Trash2,
  Activity,
  Shield,
  Lock,
  Server,
  RefreshCw,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface AxisCameraViewProps {
  cameras: Camera[];
  onRefresh: () => void;
  onSelectCameraToScan: (cameraId: string) => void;
}

export const AxisCameraView: React.FC<AxisCameraViewProps> = ({
  cameras,
  onRefresh,
  onSelectCameraToScan,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<any>('AXIS IP Camera');
  const [ipAddress, setIpAddress] = useState('192.168.1.110');
  const [port, setPort] = useState('554');
  const [username, setUsername] = useState('axis_sec_admin');
  const [password, setPassword] = useState('');
  const [streamUrl, setStreamUrl] = useState('rtsp://192.168.1.110/axis-media/media.amp?videocodec=h264');
  const [rtspProtocol, setRtspProtocol] = useState<'TCP' | 'UDP'>('TCP');
  const [modelName, setModelName] = useState('AXIS P1455-LE Network Camera');
  const [error, setError] = useState<string | null>(null);

  // Diagnostic Test Connection State
  const [testResult, setTestResult] = useState<any>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCamera(null);
    setName('');
    setLocation('');
    setType('AXIS IP Camera');
    setIpAddress(`192.168.1.${Math.floor(Math.random() * 80 + 110)}`);
    setPort('554');
    setUsername('axis_sec_admin');
    setPassword('');
    setStreamUrl('rtsp://192.168.1.110/axis-media/media.amp');
    setRtspProtocol('TCP');
    setModelName('AXIS P1455-LE Network Camera');
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cam: Camera) => {
    setEditingCamera(cam);
    setName(cam.name);
    setLocation(cam.location);
    setType(cam.type);
    setIpAddress(cam.ipAddress);
    setPort(String(cam.port));
    setUsername(cam.username || 'axis_admin');
    setPassword(''); // never prefill existing password for security
    setStreamUrl(cam.streamUrl);
    setRtspProtocol(cam.rtspProtocol || 'TCP');
    setModelName(cam.modelName || 'AXIS IP Camera');
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      setError('Please provide camera name and installation location.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingCamera) {
        await api.updateCamera(editingCamera.id, {
          name,
          location,
          type,
          ipAddress,
          port: Number(port),
          username,
          password: password || undefined,
          streamUrl,
          rtspProtocol,
          modelName,
        });
      } else {
        await api.addCamera({
          name,
          location,
          type,
          ipAddress,
          port: Number(port),
          username,
          password,
          streamUrl,
          rtspProtocol,
          modelName,
        });
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to register camera');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this camera from KLS surveillance?')) return;
    try {
      await api.deleteCamera(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await api.testCameraConnection(id);
      setTestResult({ ...res, cameraId: id });
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'ERROR',
        error: err.message || 'Connection failed',
        cameraId: id,
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleScan = async (cam: Camera) => {
    try {
      if (cam.isAiScanning) {
        await api.stopCameraScan(cam.id);
      } else {
        await api.startCameraScan(cam.id);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="kls-axis-camera-view" className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              AXIS VMS Integration &amp; Stream Gateway
            </span>
            <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONVIF Profile S &amp; ARTPEC-8
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">
            AXIS Network Camera Management
          </h1>
          <p className="text-xs text-slate-400">
            Configure IP cameras, RTSP streams, authenticated credentials, and AI scanning schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Camera Fleet"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            id="camera-add-new-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add AXIS Camera</span>
          </button>
        </div>
      </div>

      {/* Security Best Practices Reminder Banner */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-200">KLS Camera Credential Security Policy</div>
          <p className="text-[11px] leading-relaxed">
            Camera RTSP authentication passwords are encrypted and securely stored on the backend service. Passwords are never sent back or exposed in client bundles. Video streams are kept within internal network boundaries.
          </p>
        </div>
      </div>

      {/* Cameras Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Camera Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Type / Model</th>
                <th className="py-3.5 px-4">IP / Hostname</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">AI Scan</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cameras.map((cam) => {
                const isOnline = cam.status === 'ONLINE';
                const isTesting = testingId === cam.id;

                return (
                  <tr key={cam.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Camera Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <Cctv className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <div>
                          <div>{cam.name}</div>
                          {cam.isDemo && (
                            <span className="text-[9px] text-amber-400 bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.2 rounded font-mono">
                              VIRTUAL DEMO
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {cam.location}
                    </td>

                    {/* Type & Model */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{cam.type}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                        {cam.modelName}
                      </div>
                    </td>

                    {/* IP & Port */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{cam.ipAddress}:{cam.port}</div>
                      <div className="text-[10px] text-slate-500">RTSP/{cam.rtspProtocol || 'TCP'}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          isOnline
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                          }`}
                        />
                        {cam.status}
                      </span>
                    </td>

                    {/* AI Scan Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleScan(cam)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          cam.isAiScanning
                            ? 'bg-sky-950 text-sky-400 border border-sky-700 hover:bg-sky-900/60'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title={cam.isAiScanning ? 'Click to Pause AI Scanning' : 'Click to Activate AI Scanning'}
                      >
                        {cam.isAiScanning ? (
                          <>
                            <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
                            <span>AI Active</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3 h-3" />
                            <span>AI Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Test Connection Diagnostic */}
                        <button
                          onClick={() => handleTestConnection(cam.id)}
                          disabled={isTesting}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                          title="Ping & Test RTSP Handshake"
                        >
                          {isTesting ? (
                            <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Server className="w-3 h-3 text-sky-400" />
                          )}
                          <span>Test</span>
                        </button>

                        {/* View in Scanner */}
                        <button
                          onClick={() => onSelectCameraToScan(cam.id)}
                          className="px-2.5 py-1 bg-sky-900/60 hover:bg-sky-800/80 text-sky-200 rounded-lg text-[11px] font-semibold border border-sky-700 transition-colors cursor-pointer flex items-center gap-1"
                          title="Open Live Scanner Feed"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Live</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(cam)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                          title="Edit Camera Configuration"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {/* Delete */}
                        {!cam.isDemo && (
                          <button
                            onClick={() => handleDelete(cam.id)}
                            className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg border border-red-800/60 transition-colors cursor-pointer"
                            title="Delete Camera"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Connection Diagnostic Result Popover / Notification */}
      {testResult && (
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-xl ${
          testResult.success
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
            : 'bg-red-950/60 border-red-700 text-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm">
                {testResult.success ? 'RTSP Stream Connection Verified' : 'Camera Diagnostic Error'}
              </div>
              <p>{testResult.message || testResult.error}</p>
              {testResult.success && (
                <div className="text-[11px] font-mono text-emerald-300/80 flex items-center gap-3 pt-1">
                  <span>Latency: <strong>{testResult.latencyMs}ms</strong></span>
                  <span>Handshake: <strong>{testResult.rtspHandshake}</strong></span>
                  <span>Codec: <strong>{testResult.codec}</strong></span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setTestResult(null)}
            className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 bg-black/40 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add / Edit Camera Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cctv className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-slate-100 uppercase tracking-wide">
                  {editingCamera ? 'Edit Camera Configuration' : 'Register New AXIS / IP Camera'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Camera Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Main Gate AXIS P1455-LE"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Location / Zone *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Main Entrance & Perimeter"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Type & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Stream Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="AXIS IP Camera">AXIS Network IP Camera (VAPIX)</option>
                    <option value="RTSP Stream">Generic RTSP Stream</option>
                    <option value="ONVIF Camera">ONVIF Profile S Camera</option>
                    <option value="USB Webcam">USB / Direct Video Capture</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Hardware Model Name
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. AXIS ARTPEC-8 Q3538-LVE"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* IP Address & Port */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    IP Address / Hostname *
                  </label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.100"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="554"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Credentials (Username & Password) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-sky-400" />
                    <span>Camera Username</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="axis_admin"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-400" />
                    <span>Camera Password</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingCamera ? 'Leave blank to keep unchanged' : '••••••••'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Stream URL */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  RTSP Stream Media Endpoint URL
                </label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtsp://192.168.1.100/axis-media/media.amp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500 text-[11px]"
                />
              </div>

              {/* Protocol */}
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-400">Transport:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value="TCP"
                    checked={rtspProtocol === 'TCP'}
                    onChange={() => setRtspProtocol('TCP')}
                    className="text-sky-500 focus:ring-0"
                  />
                  <span>RTSP over TCP (Recommended)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value="UDP"
                    checked={rtspProtocol === 'UDP'}
                    onChange={() => setRtspProtocol('UDP')}
                    className="text-sky-500 focus:ring-0"
                  />
                  <span>UDP</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Camera...' : editingCamera ? 'Update Camera' : 'Add Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
