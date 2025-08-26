import { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { marked } from "marked";

// -------------------- Data --------------------
const phases = [
  {
    id: 1,
    title: "Research Question Definition",
    description: "Formulate research questions and hypotheses.",
    storage: "Notes in OneNote, Miro, Google Docs",
    policy: "Ensure alignment with institutional research policy.",
    fullText: `# Research Question Definition\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 2,
    title: "Project Creation",
    description: "Set up project plan, team, and resources.",
    storage: "Project management tools: Notion, Trello, Asana",
    policy: "Document ownership and roles clearly.",
    fullText: `# Project Creation\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 3,
    title: "Collection, Storage and Documentation",
    description: "Gather data from experiments, surveys, or external sources.",
    storage: "Secure server, cloud storage, version-controlled repositories",
    policy: "Follow GDPR and internal data storage guidelines.",
    fullText: `# Collection, Storage and Documentation\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 4,
    title: "Evaluation and Selection",
    description: "Assess data quality and select relevant datasets.",
    storage: "Filtered datasets stored with metadata in repository",
    policy: "Document selection criteria and decisions.",
    fullText: `# Evaluation and Selection\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 5,
    title: "Processing and Analysing",
    description: "Clean, process, and analyse data using statistical tools.",
    storage: "Processed datasets stored in CSV, SQL, or analysis software",
    policy: "Ensure reproducibility and documentation of steps.",
    fullText: `# Processing and Analysing\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 6,
    title: "Publishing and Access Management",
    description: "Write papers, manage peer-review and open access.",
    storage: "Overleaf, Word, Zenodo, ResearchGate",
    policy: "Follow open access and copyright regulations.",
    fullText: `# Publishing and Access Management\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 7,
    title: "Preservation of Data",
    description: "Long-term storage of datasets and documentation.",
    storage: "Institutional repositories, cloud archives, GitHub",
    policy: "Ensure data integrity and compliance with retention policies.",
    fullText: `# Preservation of Data\n Lorem ipsum dolor sit amet...`,
  },
  {
    id: 8,
    title: "Verification and Data-reuse",
    description: "Verify results, allow for reuse and replication.",
    storage: "Repositories with version control and DOIs",
    policy: "Ensure licenses allow reuse and proper citation.",
    fullText: `# Verification and Reuse of Data\n Lorem ipsum dolor sit amet...`,
  },
];

// -------------------- Component --------------------
export default function DonutWithArrow() {
  const [active, setActive] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    description: "",
    storage: "",
    policy: "",
  });
  const svgRef = useRef();

  const width = 800;
  const height = 800;
  const radius = 350;
  const innerRadius = 130;

  // Memoize pie layout & scales
  const { pieData, arc, labelArc, color } = useMemo(() => {
    const pie = d3
      .pie()
      .value(() => 1)
      .padAngle(0.015);
    const pieData = pie(phases);
    return {
      pieData,
      arc: d3.arc().innerRadius(innerRadius).outerRadius(radius),
      labelArc: d3
        .arc()
        .innerRadius((innerRadius + radius) / 2)
        .outerRadius((innerRadius + radius) / 2),
      color: d3.scaleOrdinal(d3.schemeTableau10),
    };
  }, []);

  // Render SVG
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Donut segments
    g.selectAll("path")
      .data(pieData)
      .join("path")
      .attr("class", "donut-segment")
      .attr("d", arc)
      .attr("fill", (_, i) => color(i))
      .style("cursor", "pointer")
      .on("click", (_, d) => setActive(phases[d.index]))
      .on("mouseenter", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "black")
          .attr("stroke-width", 3);
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          title: phases[d.index].title,
          description: phases[d.index].description,
          storage: phases[d.index].storage,
          policy: phases[d.index].policy,
        });
      })
      .on("mousemove", (event) =>
        setTooltip((prev) => ({ ...prev, x: event.clientX, y: event.clientY }))
      )
      .on("mouseleave", (event, d) => {
        d3.select(event.currentTarget)
          .attr(
            "stroke",
            active && active.id === phases[d.index].id ? "black" : "none"
          )
          .attr(
            "stroke-width",
            active && active.id === phases[d.index].id ? 1.5 : 0
          );
        setTooltip({
          visible: false,
          x: 0,
          y: 0,
          title: "",
          description: "",
          storage: "",
          policy: "",
        });
      });

    // Labels
    g.selectAll("text")
      .data(pieData)
      .join("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("fill", "white")
      .style("font-family", "'Inter', sans-serif")
      .each(function (d) {
        const words = phases[d.index].title.split(" ");
        const lineHeight = 20; // pixels between lines
        const textHeight = words.length * lineHeight; // total height of text block
        let y = 0;
        d3.select(this)
          .selectAll("tspan")
          .data(words)
          .join("tspan")
          .text((word) => word)
          .attr("x", 0)
          .attr("y", (_, i) => y + i * lineHeight - textHeight / 2)
          .attr("dy", 0);
      });

    // Arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 15)
      .attr("markerHeight", 15)
      .attr("refX", 0)
      .attr("refY", 3)
      .attr("orient", "270")
      .append("path")
      .attr("d", "M0,0 L0,6 L9,3 z")
      .attr("fill", "grey");

    const arrowPath = d3
      .arc()
      .innerRadius(radius + 20)
      .outerRadius(radius + 20)
      .startAngle(1.5 * Math.PI - 0.15)
      .endAngle(0.1);

    svg
      .append("path")
      .attr("d", arrowPath())
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");
  }, [
    pieData,
    arc,
    labelArc,
    color,
    width,
    height,
    radius,
    innerRadius,
    active,
  ]);

  // Active segment stroke
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg
      .selectAll(".donut-segment")
      .attr("stroke", (d) =>
        active && active.id === phases[d.index].id ? "black" : "none"
      )
      .attr("stroke-width", (d) =>
        active && active.id === phases[d.index].id ? 1.5 : 0
      );
  }, [active]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 relative">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Research Life Cycle
      </h1>
      <svg ref={svgRef} width={width} height={height}></svg>

      {/* Tooltip with description, storage, policy */}
      {tooltip.visible && (
        <div
          id="tooltip"
          style={{
            position: "fixed",
            top: tooltip.y + 15,
            left: tooltip.x + 15,
            background: "white",
            padding: "8px 12px",
            borderRadius: "8px",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
            fontSize: "0.875rem",
            pointerEvents: "none",
            zIndex: 50,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <strong>{tooltip.title}</strong>
          <p style={{ margin: "2px 0" }}>{tooltip.description}</p>
          <p style={{ margin: "2px 0" }}>
            <strong>Storage:</strong> {tooltip.storage}
          </p>
          <p style={{ margin: "2px 0" }}>
            <strong>Policy:</strong> {tooltip.policy}
          </p>
        </div>
      )}

      {/* Active panel (click) with full text and additional info */}
      {active && (
        <div className="fixed bottom-10 right-10 bg-white p-6 rounded-2xl shadow-lg max-w-lg overflow-auto max-h-[70vh]">
          {/* Title */}
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {active.title}
          </h2>

          {/* Description, Storage, Policy */}
          <p className="mb-1">
            <strong>Description:</strong> {active.description}
          </p>
          <p className="mb-1">
            <strong>Storage:</strong> {active.storage}
          </p>
          <p className="mb-3">
            <strong>Policy:</strong> {active.policy}
          </p>

          {/* Full Text */}
          <div
            dangerouslySetInnerHTML={{ __html: marked.parse(active.fullText) }}
          />

          {/* Close button */}
          <button
            onClick={() => setActive(null)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
