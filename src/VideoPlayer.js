import './App.css';
import * as util from './util';
import YouTube from 'react-youtube';
import React from 'react';
import { useState } from 'react';

function VideoPlayer() {
    const [player, setPlayer] = useState({"getCurrentTime": () => 0});
    const [videoId, setVideoId] = useState("F8pEYNY_n0c");
    const initialVideoUrl = "https://www.youtube.com/watch?v=F8pEYNY_n0c";
    const [videoTime, setVideoTime] = useState("00:00:00");
    const timeUpdateIntervalIDRef = React.useRef(null);
    const opts = {
        height: '390',
        width: '640',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 1,
        },
    };
    
    const startTimeUpdate = React.useCallback(() => {
        timeUpdateIntervalIDRef.current = setInterval(() => {
            updateVideoTimeDisplay();
        }, 10);
    }, []);

    const stopTimeUpdate = React.useCallback(() => {
        clearInterval(timeUpdateIntervalIDRef.current);
        timeUpdateIntervalIDRef.current = null;
    }, []);

    React.useEffect(() => {
        return () => clearInterval(timeUpdateIntervalIDRef.current); // to clean up on unmount
    }, []);

    const updateVideoTimeDisplay = () => {
        setVideoTime(util.secondsToTimestamp(getVideoTime()));
    }
    const handleVideoIdFormSubmit = (ev) => {
        console.log(ev.target);
        loadVideoFromUrl(ev.target[0].value);
        ev.preventDefault();
    }

    const handleVideoTimeFormSubmit = (ev) => {
        let seconds = util.timestampToSeconds(videoTime);
        if (isNaN(seconds)) {
            seconds = util.parse_timestamp(videoTime);
        }
        if (isNaN(seconds)) {
            // this.timedisplay.value = "Invalid timestamp.";
            updateVideoTimeDisplay();
            ev.preventDefault();
            return false;
        }
        player.seekTo(seconds, true);
        ev.preventDefault();
    }

    const onPlayerReady = (event) => {
        setPlayer(event.target);
        console.log("OnPlayerReady", event.target, player);
        updateVideoTimeDisplay();
        event.target.playVideo();
    }

    const onPlayerStateChange = (event) => {
        console.log("Playerstatechange data:", event.data);
        updateVideoTimeDisplay();
        // if (event.data === 1 && !timeUpdateIntervalIDRef.current) {
        //     startTimeUpdate();
        // } else {
        //     stopTimeUpdate();
        // }
    }

    const loadVideoFromUrl = (url) => {
        setVideoId(util.getIdFromUrl(url));
        loadVideo(videoId);
    }

    const loadVideo = (id) => {
        console.log("Loading", id)
        player.loadVideoById(id);
    }

    const stopVideo = () => {
        player.stopVideo();
    }

    const getVideoTime = () => {
        return Math.floor(player.getCurrentTime());
    }

    return (
        <div className="VideoPlayer">
            <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} onStateChange={onPlayerStateChange} />;
            <form onSubmit={handleVideoIdFormSubmit}>
                <input name="videourl" defaultValue={initialVideoUrl} size="40" />
                <button type="submit">Load Video</button>
            </form>
            <form id="videotimeform" onSubmit={handleVideoTimeFormSubmit}>
                <input name="timedisplay" value={videoTime} onChange={e => setVideoTime(e.target.value)} />
                <button type="submit">Jump to Time</button>
            </form>
        </div>
    );
}

export default VideoPlayer;
