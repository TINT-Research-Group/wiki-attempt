const researchData = [
  {
    person: "Shiwen LIU",
    topics: [
      "Agent Network",
      "RAG Security",
      "Agent Replication",
      "AI Collusion"
    ]
  },
  {
    person: "Yue HUANG",
    topics: [
      "Internet Security",
      "Blockchain Security",
      "Agent Security",
      "Formal Method"
    ]
  },
  {
    person: "Junfeng WANG",
    topics: [
      "ML System",
      "AI Infra",
      "High Performance Network",
      "Operating System",
      "HPC",
      "Compiler",
      "RISC-V"
    ]
  },
  {
    person: "Yanlin YU",
    topics: [
      "Agent Security",
      "Formal Method",
      "AI Collusion",
      "Multi-Agent System"
    ]
  }
];

/**
 * ==========
 * Data helpers
 * ==========
 */

function getAllPeople(data) {
  return data.map(item => item.person);
}

function getAllTopics(data) {
  return [...new Set(data.flatMap(item => item.topics))].sort();
}

function getTopicsByPerson(data, personName) {
  const found = data.find(item => item.person === personName);
  return found ? found.topics : [];
}

function getPeopleByTopic(data, topicName) {
  return data
    .filter(item => item.topics.includes(topicName))
    .map(item => item.person);
}

function getCommonTopics(data, personA, personB) {
  const topicsA = new Set(getTopicsByPerson(data, personA));
  const topicsB = new Set(getTopicsByPerson(data, personB));
  return [...topicsA].filter(topic => topicsB.has(topic));
}

function getCommonPeople(data, topicA, topicB) {
  const peopleA = new Set(getPeopleByTopic(data, topicA));
  const peopleB = new Set(getPeopleByTopic(data, topicB));
  return [...peopleA].filter(person => peopleB.has(person));
}

/**
 * ==========
 * UI helpers
 * ==========
 */

const networkContainer = document.getElementById("network");
const treeContainer = document.getElementById("treeContainer");
const detailContainer = document.getElementById("detailContainer");
const selectionMeta = document.getElementById("selectionMeta");

const modePeopleBtn = document.getElementById("modePeopleBtn");
const modeTopicBtn = document.getElementById("modeTopicBtn");

let currentMode = "people";
let network = null;
let currentGraph = { nodes: [], edges: [] };

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderEmpty() {
  treeContainer.innerHTML = `<div class="empty-state">No selection yet.</div>`;
  detailContainer.innerHTML = `<div class="empty-state">No detail yet.</div>`;
}

function renderTree(rootLabel, children) {
  if (!rootLabel) {
    renderEmpty();
    return;
  }

  const childHtml = children
    .map(item => `<li><span class="tree-leaf">${escapeHtml(item)}</span></li>`)
    .join("");

  treeContainer.innerHTML = `
    <ul class="tree-root">
      <li>
        <span class="tree-node">${escapeHtml(rootLabel)}</span>
        <ul class="tree-children">
          ${childHtml || `<li><span class="tree-leaf">No related item</span></li>`}
        </ul>
      </li>
    </ul>
  `;
}

function renderBadges(items) {
  if (!items || !items.length) {
    return `<div class="empty-state">None</div>`;
  }

  return items
    .map(item => `<span class="badge">${escapeHtml(item)}</span>`)
    .join("");
}

function renderNodeDetail(title, typeLabel, relatedLabel, relatedItems) {
  detailContainer.innerHTML = `
    <div class="detail-card">
      <h3>${escapeHtml(title)}</h3>
      <p>Type: ${escapeHtml(typeLabel)}</p>
    </div>

    <div class="detail-card">
      <h3>${escapeHtml(relatedLabel)}</h3>
      <div>${renderBadges(relatedItems)}</div>
    </div>
  `;
}

function renderEdgeDetail(source, target, relationLabel, relationItems) {
  detailContainer.innerHTML = `
    <div class="detail-card">
      <h3>${escapeHtml(source)} ↔ ${escapeHtml(target)}</h3>
      <p>This edge represents the shared relationship between the two selected nodes.</p>
    </div>

    <div class="detail-card">
      <h3>${escapeHtml(relationLabel)}</h3>
      <div>${renderBadges(relationItems)}</div>
    </div>
  `;
}

/**
 * ==========
 * Graph builders
 * ==========
 */

function buildPeopleGraph(data) {
  const people = getAllPeople(data);

  const nodes = people.map(person => ({
    id: person,
    label: person,
    shape: "dot",
    size: 26,
    font: {
      color: "#E5F7FF",
      size: 18,
      face: "Inter, Segoe UI, sans-serif",
      strokeWidth: 0
    },
    color: {
      border: "#75D9FF",
      background: "#12345D",
      highlight: {
        border: "#A3EEFF",
        background: "#1A4A84"
      },
      hover: {
        border: "#A3EEFF",
        background: "#1A4A84"
      }
    }
  }));

  const edges = [];

  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      const a = people[i];
      const b = people[j];
      const commonTopics = getCommonTopics(data, a, b);

      if (commonTopics.length > 0) {
        edges.push({
          id: `edge__${a}__${b}`,
          from: a,
          to: b,
          width: 1 + commonTopics.length,
          label: String(commonTopics.length),
          title: `Shared topics: ${commonTopics.join(", ")}`,
          smooth: {
            enabled: true,
            type: "dynamic"
          },
          color: {
            color: "rgba(117, 217, 255, 0.55)",
            highlight: "#A3EEFF",
            hover: "#A3EEFF"
          },
          font: {
            color: "#D6F4FF",
            size: 14,
            strokeWidth: 0
          },
          relationItems: commonTopics
        });
      }
    }
  }

  return { nodes, edges };
}

function buildTopicGraph(data) {
  const topics = getAllTopics(data);

  const nodes = topics.map(topic => ({
    id: topic,
    label: topic,
    shape: "dot",
    size: 24,
    font: {
      color: "#E5F7FF",
      size: 17,
      face: "Inter, Segoe UI, sans-serif",
      strokeWidth: 0
    },
    color: {
      border: "#75D9FF",
      background: "#17385F",
      highlight: {
        border: "#A3EEFF",
        background: "#1C4B7E"
      },
      hover: {
        border: "#A3EEFF",
        background: "#1C4B7E"
      }
    }
  }));

  const edges = [];

  for (let i = 0; i < topics.length; i += 1) {
    for (let j = i + 1; j < topics.length; j += 1) {
      const a = topics[i];
      const b = topics[j];
      const commonPeople = getCommonPeople(data, a, b);

      if (commonPeople.length > 0) {
        edges.push({
          id: `edge__${a}__${b}`,
          from: a,
          to: b,
          width: 1 + commonPeople.length,
          label: String(commonPeople.length),
          title: `Shared people: ${commonPeople.join(", ")}`,
          smooth: {
            enabled: true,
            type: "dynamic"
          },
          color: {
            color: "rgba(117, 217, 255, 0.55)",
            highlight: "#A3EEFF",
            hover: "#A3EEFF"
          },
          font: {
            color: "#D6F4FF",
            size: 14,
            strokeWidth: 0
          },
          relationItems: commonPeople
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * ==========
 * Selection handlers
 * ==========
 */

function handleNodeSelection(nodeId) {
  if (currentMode === "people") {
    const topics = getTopicsByPerson(researchData, nodeId);
    selectionMeta.textContent = `Selected person node: ${nodeId}`;
    renderTree(nodeId, topics);
    renderNodeDetail(nodeId, "Person", "Interested Topics", topics);
    return;
  }

  const people = getPeopleByTopic(researchData, nodeId);
  selectionMeta.textContent = `Selected topic node: ${nodeId}`;
  renderTree(nodeId, people);
  renderNodeDetail(nodeId, "Topic", "Related People", people);
}

function handleEdgeSelection(edgeId) {
  const edge = currentGraph.edges.find(item => item.id === edgeId);
  if (!edge) return;

  if (currentMode === "people") {
    selectionMeta.textContent = `Selected edge between people: ${edge.from} ↔ ${edge.to}`;
    treeContainer.innerHTML = `
      <div class="detail-card">
        <h3>${escapeHtml(edge.from)} ↔ ${escapeHtml(edge.to)}</h3>
        <p>These two people are connected by the following shared research topics.</p>
      </div>
    `;
    renderEdgeDetail(edge.from, edge.to, "Shared Topics", edge.relationItems || []);
    return;
  }

  selectionMeta.textContent = `Selected edge between topics: ${edge.from} ↔ ${edge.to}`;
  treeContainer.innerHTML = `
    <div class="detail-card">
      <h3>${escapeHtml(edge.from)} ↔ ${escapeHtml(edge.to)}</h3>
      <p>These two topics are connected by the following shared researchers.</p>
    </div>
  `;
  renderEdgeDetail(edge.from, edge.to, "Shared People", edge.relationItems || []);
}

/**
 * ==========
 * Network render
 * ==========
 */

function renderNetwork(mode) {
  currentMode = mode;

  currentGraph = mode === "people"
    ? buildPeopleGraph(researchData)
    : buildTopicGraph(researchData);

  const data = {
    nodes: new vis.DataSet(currentGraph.nodes),
    edges: new vis.DataSet(currentGraph.edges)
  };

  const options = {
    autoResize: true,
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        iterations: 300,
        updateInterval: 25
      },
      barnesHut: {
        gravitationalConstant: -3800,
        centralGravity: 0.22,
        springLength: 170,
        springConstant: 0.035,
        damping: 0.16
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 120,
      navigationButtons: true,
      keyboard: true
    },
    nodes: {
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: "rgba(0, 0, 0, 0.35)",
        size: 14,
        x: 0,
        y: 0
      }
    },
    edges: {
      shadow: false,
      selectionWidth: 2.5
    }
  };

  if (network) {
    network.destroy();
  }

  network = new vis.Network(networkContainer, data, options);

  network.on("click", params => {
    if (params.nodes.length > 0) {
      handleNodeSelection(params.nodes[0]);
      return;
    }

    if (params.edges.length > 0) {
      handleEdgeSelection(params.edges[0]);
      return;
    }

    selectionMeta.textContent = "Click a node or an edge to inspect the relationship.";
    renderEmpty();
  });
}

/**
 * ==========
 * Mode switch
 * ==========
 */

function updateModeButtons() {
  modePeopleBtn.classList.toggle("active", currentMode === "people");
  modeTopicBtn.classList.toggle("active", currentMode === "topic");
}

modePeopleBtn.addEventListener("click", () => {
  renderNetwork("people");
  updateModeButtons();
  selectionMeta.textContent = "People View enabled. Click a node or an edge to inspect the relationship.";
  renderEmpty();
});

modeTopicBtn.addEventListener("click", () => {
  renderNetwork("topic");
  updateModeButtons();
  selectionMeta.textContent = "Topic View enabled. Click a node or an edge to inspect the relationship.";
  renderEmpty();
});

/**
 * ==========
 * Init
 * ==========
 */

renderNetwork("people");
updateModeButtons();
renderEmpty();
selectionMeta.textContent = "People View enabled. Click a node or an edge to inspect the relationship.";
