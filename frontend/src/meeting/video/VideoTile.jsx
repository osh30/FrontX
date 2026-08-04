import { ParticipantTile } from '@livekit/components-react';

const VideoTile = ({ track, participant }) => {
  return (
    <ParticipantTile
      track={track}
      participant={participant}
      className="meeting-video-tile"
    />
  );
};

export default VideoTile;
