import { useEffect, useState, useCallback } from 'react';
import { RoomEvent } from 'livekit-client';
import { Video, Mic, Settings2, X, RefreshCw } from 'lucide-react';

const getActiveDeviceIds = (room) => {
  const pick = (publications) => {
    const track = publications && publications.size > 0
      ? Array.from(publications.values())[0].track
      : null;
    if (!track || !track.mediaStreamTrack) return '';
    try {
      return track.mediaStreamTrack.getSettings().deviceId || '';
    } catch {
      return '';
    }
  };
  return {
    audio: pick(room.localParticipant.audioTrackPublications),
    video: pick(room.localParticipant.videoTrackPublications),
  };
};

const labelFor = (device, index) => device.label || (device.kind === 'audioinput' ? `Microphone ${index + 1}` : `Camera ${index + 1}`);

const DeviceMenu = ({ open, room, onClose }) => {
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const [active, setActive] = useState({ audio: '', video: '' });
  const [error, setError] = useState('');
  const [switching, setSwitching] = useState('');

  const loadDevices = useCallback(async () => {
    setError('');
    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        setError('Grant camera & microphone access to list your devices.');
      }
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        audio: list.filter((device) => device.kind === 'audioinput'),
        video: list.filter((device) => device.kind === 'videoinput'),
      });
    } catch (err) {
      setError('Could not load devices.');
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    loadDevices();
    return undefined;
  }, [open, loadDevices]);

  useEffect(() => {
    if (!open || !room) return undefined;
    const init = getActiveDeviceIds(room);
    setActive((prev) => ({
      audio: init.audio || prev.audio,
      video: init.video || prev.video,
    }));
    const handler = (kind, deviceId) =>
      setActive((prev) => ({ ...prev, [kind]: deviceId }));
    room.on(RoomEvent.ActiveDeviceChanged, handler);
    return () => room.off(RoomEvent.ActiveDeviceChanged, handler);
  }, [open, room]);

  const handleSwitch = async (kind, deviceId) => {
    if (!deviceId || switching) return;
    setSwitching(kind);
    setError('');
    try {
      await room.switchActiveDevice(kind, deviceId);
      setActive((prev) => ({ ...prev, [kind]: deviceId }));
    } catch (err) {
      setError('Could not switch device.');
    } finally {
      setSwitching('');
    }
  };

  if (!open) return null;

  return (
    <div className="fx-device" onClick={onClose}>
      <div className="fx-device__card fx-glass" onClick={(event) => event.stopPropagation()}>
        <header className="fx-device__head">
          <span className="fx-device__title">
            <Settings2 size={18} /> Device settings
          </span>
          <button type="button" className="fx-device__close" onClick={onClose} aria-label="Close device settings">
            <X size={18} />
          </button>
        </header>

        <div className="fx-device__body">
          <div className="fx-device__group">
            <span className="fx-device__label">
              <Video size={15} /> Camera
            </span>
            <select
              className="fx-device__select"
              value={active.video}
              disabled={switching === 'videoinput'}
              onChange={(event) => handleSwitch('videoinput', event.target.value)}
            >
              <option value="">{devices.video.length ? 'Default camera' : 'No camera found'}</option>
              {devices.video.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {labelFor(device, index)}
                </option>
              ))}
            </select>
          </div>

          <div className="fx-device__group">
            <span className="fx-device__label">
              <Mic size={15} /> Microphone
            </span>
            <select
              className="fx-device__select"
              value={active.audio}
              disabled={switching === 'audioinput'}
              onChange={(event) => handleSwitch('audioinput', event.target.value)}
            >
              <option value="">{devices.audio.length ? 'Default microphone' : 'No microphone found'}</option>
              {devices.audio.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {labelFor(device, index)}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="fx-device__error">{error}</p>}

          <p className="fx-device__hint">Devices switch instantly for everyone in the meeting.</p>
        </div>

        <footer className="fx-device__foot">
          <button type="button" className="fx-device__refresh" onClick={loadDevices}>
            <RefreshCw size={14} /> Refresh devices
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeviceMenu;
