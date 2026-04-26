import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function LiveRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, livekit_url, titre } = location.state || {};

  useEffect(() => {
    if (!token || !livekit_url) {
      navigate("/live");
    }
  }, [token, livekit_url]);

  if (!token || !livekit_url) return null;

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0A0A0A" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "12px 24px",
        background: "rgba(10,10,10,.95)",
        borderBottom: "1px solid rgba(201,169,106,.15)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem" }}>
          <span style={{ color: "#F8F5F2" }}>Meta'</span>
          <span style={{ color: "#C9A96A" }}>Morph'</span>
          <span style={{ color: "#C2185B" }}>Ose</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C2185B", display: "inline-block", animation: "pulse 1.5s infinite" }}/>
          <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: ".72rem", color: "rgba(248,245,242,.6)", letterSpacing: ".1em", textTransform: "uppercase" }}>
            {titre || "Live en cours"}
          </span>
        </div>
        <button onClick={() => navigate("/live")} style={{
          background: "rgba(194,24,91,.1)", border: "1px solid rgba(194,24,91,.3)",
          color: "#C2185B", fontFamily: "'Montserrat',sans-serif", fontSize: ".7rem",
          fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
          padding: "8px 16px", borderRadius: "2px", cursor: "pointer"
        }}>
          Quitter
        </button>
      </div>

      <div style={{ paddingTop: "60px", height: "100%" }}>
        <LiveKitRoom
          serverUrl={livekit_url}
          token={token}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={() => navigate("/live")}
          style={{ height: "calc(100vh - 60px)" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
