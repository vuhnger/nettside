export type GridPosition = {
  x: number;
  y: number;
};

type PathNode = {
  position: GridPosition;
  cost: number;
  score: number;
  lineDeviation: number;
  order: number;
  parent: PathNode | null;
};

export type AStarOptions = {
  columns: number;
  rows: number;
  start: GridPosition;
  goal: GridPosition;
  blocked?: ReadonlySet<string>;
};

export type AStarResult = {
  path: GridPosition[];
  visited: GridPosition[];
};

export const getGridPositionKey = ({ x, y }: GridPosition) => `${x},${y}`;

const getDistance = (first: GridPosition, second: GridPosition) =>
  Math.abs(first.x - second.x) + Math.abs(first.y - second.y);

const getLineDeviation = (
  position: GridPosition,
  start: GridPosition,
  goal: GridPosition,
) =>
  Math.abs(
    (position.x - start.x) * (goal.y - start.y) -
      (position.y - start.y) * (goal.x - start.x),
  );

const reconstructPath = (node: PathNode) => {
  const path: GridPosition[] = [];
  let current: PathNode | null = node;

  while (current.parent) {
    path.unshift(current.position);
    current = current.parent;
  }

  return path;
};

export const findAStarPath = ({
  columns,
  rows,
  start,
  goal,
  blocked = new Set<string>(),
}: AStarOptions): AStarResult => {
  if (
    columns <= 0 ||
    rows <= 0 ||
    start.x < 0 ||
    start.x >= columns ||
    start.y < 0 ||
    start.y >= rows ||
    goal.x < 0 ||
    goal.x >= columns ||
    goal.y < 0 ||
    goal.y >= rows ||
    blocked.has(getGridPositionKey(start)) ||
    blocked.has(getGridPositionKey(goal))
  ) {
    return { path: [], visited: [] };
  }

  if (start.x === goal.x && start.y === goal.y) {
    return { path: [], visited: [start] };
  }

  let nextOrder = 1;
  const startNode: PathNode = {
    position: start,
    cost: 0,
    score: getDistance(start, goal),
    lineDeviation: 0,
    order: 0,
    parent: null,
  };
  const openSet = [startNode];
  const openByPosition = new Map([[getGridPositionKey(start), startNode]]);
  const closedSet = new Set<string>();
  const visited: GridPosition[] = [];

  while (openSet.length > 0) {
    let currentIndex = 0;
    for (let index = 1; index < openSet.length; index += 1) {
      const candidate = openSet[index];
      const current = openSet[currentIndex];
      if (
        candidate.score < current.score ||
        (candidate.score === current.score && candidate.lineDeviation < current.lineDeviation) ||
        (candidate.score === current.score &&
          candidate.lineDeviation === current.lineDeviation &&
          candidate.order < current.order)
      ) {
        currentIndex = index;
      }
    }

    const current = openSet.splice(currentIndex, 1)[0];
    const currentKey = getGridPositionKey(current.position);
    openByPosition.delete(currentKey);
    closedSet.add(currentKey);
    visited.push(current.position);

    if (current.position.x === goal.x && current.position.y === goal.y) {
      return { path: reconstructPath(current), visited };
    }

    const neighbors = [
      { x: current.position.x + 1, y: current.position.y },
      { x: current.position.x, y: current.position.y + 1 },
      { x: current.position.x - 1, y: current.position.y },
      { x: current.position.x, y: current.position.y - 1 },
    ];

    for (const position of neighbors) {
      const key = getGridPositionKey(position);
      if (
        position.x < 0 ||
        position.x >= columns ||
        position.y < 0 ||
        position.y >= rows ||
        blocked.has(key) ||
        closedSet.has(key)
      ) {
        continue;
      }

      const cost = current.cost + 1;
      const existing = openByPosition.get(key);
      if (existing && cost >= existing.cost) continue;

      if (existing) {
        existing.cost = cost;
        existing.score = cost + getDistance(position, goal);
        existing.parent = current;
        continue;
      }

      const node: PathNode = {
        position,
        cost,
        score: cost + getDistance(position, goal),
        lineDeviation: getLineDeviation(position, start, goal),
        order: nextOrder,
        parent: current,
      };
      nextOrder += 1;
      openSet.push(node);
      openByPosition.set(key, node);
    }
  }

  return { path: [], visited };
};
