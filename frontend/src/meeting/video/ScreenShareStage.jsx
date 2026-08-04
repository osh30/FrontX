import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import VideoTile from './VideoTile';

const ScreenShareStage = () => {
  const screens = useTracks([Track.Source.ScreenShare], { onlySubscribed: false });

  if (screens.length === 0) return null;

  return (
    <div className="meeting-screen-share-stage">
      {screens.map((track) => (
        <VideoTile key={track.participant.identity} track={track} />
      ))}
    </div>
  );
};

export default ScreenShareStage;
