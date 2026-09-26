import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("HabitQuest application error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main style={{ minHeight:"100vh",background:"#06060f",color:"#e8d090",display:"grid",placeItems:"center",padding:24,fontFamily:"monospace" }}>
        <section style={{ maxWidth:480,border:"1px solid #c9a84c55",borderRadius:10,padding:24,background:"#11111b",textAlign:"center" }}>
          <h1 style={{ marginTop:0,fontSize:18 }}>HabitQuest needs a refresh</h1>
          <p style={{ color:"#aaa7a0",lineHeight:1.6 }}>Something went wrong while rendering the app. Your saved account data was not exposed on this screen.</p>
          <button onClick={() => window.location.reload()} style={{ padding:"10px 16px",borderRadius:6,border:"1px solid #c9a84c80",background:"#c9a84c20",color:"#e8d090",cursor:"pointer" }}>Refresh app</button>
        </section>
      </main>
    );
  }
}
