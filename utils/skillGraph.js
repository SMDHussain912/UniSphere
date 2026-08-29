const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const SkillNode = require('../models/SkillNode');

const GRAPH_PATH = path.join(__dirname, '..', 'content', 'skills', 'graph.yml');

let cachedGraph = null;

const loadGraph = () => {
  if (cachedGraph) return cachedGraph;

  const raw = fs.readFileSync(GRAPH_PATH, 'utf8');
  const nodes = yaml.load(raw);

  if (!Array.isArray(nodes)) {
    throw new Error('Skill graph YAML must be an array of skill nodes');
  }

  const nodeMap = new Map();
  const childrenMap = new Map();

  nodes.forEach((node) => {
    if (!node.key || !node.name) {
      throw new Error('Each skill node must have a key and name');
    }
    const key = node.key.toLowerCase();
    nodeMap.set(key, {
      key,
      name: node.name,
      parentKey: node.parentKey ? node.parentKey.toLowerCase() : null,
      description: node.description || '',
      order: node.order || 0,
      category: node.category || 'general',
    });
    if (node.parentKey) {
      const parentKey = node.parentKey.toLowerCase();
      if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, []);
      childrenMap.get(parentKey).push(key);
    }
  });

  cachedGraph = { nodes: nodeMap, children: childrenMap };
  return cachedGraph;
};

const getSkill = (key) => {
  const graph = loadGraph();
  return graph.nodes.get(key.toLowerCase()) || null;
};

const getChildren = (key) => {
  const graph = loadGraph();
  return graph.children.get(key.toLowerCase()) || [];
};

const getAncestors = (key) => {
  const graph = loadGraph();
  const ancestors = [];
  let current = graph.nodes.get(key.toLowerCase());
  while (current && current.parentKey) {
    const parent = graph.nodes.get(current.parentKey);
    if (parent) ancestors.push(parent);
    current = parent;
  }
  return ancestors;
};

const getDescendants = (key) => {
  const graph = loadGraph();
  const descendants = [];
  const queue = [key.toLowerCase()];
  while (queue.length > 0) {
    const current = queue.shift();
    const children = graph.children.get(current) || [];
    children.forEach((childKey) => {
      const child = graph.nodes.get(childKey);
      if (child) {
        descendants.push(child);
        queue.push(childKey);
      }
    });
  }
  return descendants;
};

const getRootSkills = () => {
  const graph = loadGraph();
  return Array.from(graph.nodes.values()).filter((n) => !n.parentKey);
};

const getTree = () => {
  const roots = getRootSkills();
  const buildTree = (node) => {
    const children = getChildren(node.key).map((childKey) => {
      const child = getSkill(childKey);
      return child ? buildTree(child) : null;
    }).filter(Boolean);
    return { ...node, children };
  };
  return roots.map(buildTree).sort((a, b) => a.order - b.order);
};

const seedGraph = async () => {
  const graph = loadGraph();
  const operations = Array.from(graph.nodes.values()).map((node) => ({
    updateOne: {
      filter: { key: node.key },
      update: { $set: node },
      upsert: true,
    },
  }));
  if (operations.length > 0) {
    await SkillNode.bulkWrite(operations);
  }
  return graph.nodes.size;
};

const invalidateCache = () => {
  cachedGraph = null;
};

module.exports = {
  loadGraph,
  getSkill,
  getChildren,
  getAncestors,
  getDescendants,
  getRootSkills,
  getTree,
  seedGraph,
  invalidateCache,
};