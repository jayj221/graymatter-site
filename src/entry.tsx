// Entry point for the static build (GitHub Pages). The pages are plain React, so the whole
// site ships as files: no server, no framework runtime. Routing is one check of the path,
// with 404.html serving the same bundle so a deep link like /thank-you?ref=… still works.
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import Home from "../app/page";
import ThankYou from "../app/thank-you/page";
import Agents from "../app/agents";

const path = location.pathname.replace(/\/+$/, "");
const page = path.endsWith("/thank-you") ? <ThankYou /> : path.endsWith("/agents") ? <Agents /> : <Home />;
createRoot(document.getElementById("root")!).render(page);
