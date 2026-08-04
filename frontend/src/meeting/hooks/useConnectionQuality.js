import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export const useConnectionQuality = () => {
  const room = useRoomContext();
  const [qualityMap, setQualityMap] = useState({});

  useEffect(() => {
    if (!room) return undefined;
    const init = {};
    const participantsMap = room.remoteParticipants || room.participants;
    if (participantsMap && typeof participantsMap.forEach === 'function') {
      participantsMap.forEach((participant) => {
        init[participant.identity] = participant.connectionQuality || 'unknown';
      });
    }
    if (room.localParticipant) {
      init[room.localParticipant.identity] = room.localParticipant.connectionQuality || 'unknown';
    }
    setQualityMap(init);

    const handler = (quality, participant) => {
      setQualityMap((prev) => ({ ...prev, [participant.identity]: quality }));
    };
    room.on(RoomEvent.ConnectionQualityChanged, handler);
    return () => room.off(RoomEvent.ConnectionQualityChanged, handler);
  }, [room]);

  return qualityMap;
};
