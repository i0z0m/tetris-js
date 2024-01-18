const board = [];
for (let y = -1; y < 21; y++) {
  board[y] = [];
  for (let x = -1; x < 11; x++) {
    if (y === 20 || x < 0 || x >= 10) {
      board[y][x] = 1;
    } else {
      board[y][x] = 0;
    }
  }
}

const showBoard = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      const v = board[y][x];
      let edgeColor, bgColor;
      if (v === 0) {
        edgeColor = '#888';
        bgColor = '#000';
      } else {
        switch (v) {
          case 1: // I型（シアン）
            edgeColor = bgColor = 'hsl(180, 100%, 50%)';
            break;
          case 2: // O型（黄色）
            edgeColor = bgColor = 'hsl(60, 100%, 50%)';
            break;
          case 3: // T型（紫）
            edgeColor = bgColor = 'hsl(300, 100%, 50%)';
            break;
          case 4: // S型（緑）
            edgeColor = bgColor = 'hsl(120, 100%, 50%)';
            break;
          case 5: // Z型（赤）
            edgeColor = bgColor = 'hsl(0, 100%, 50%)';
            break;
          case 6: // J型（青）
            edgeColor = bgColor = 'hsl(240, 100%, 50%)';
            break;
          case 7: // L型（オレンジ）
            edgeColor = bgColor = 'hsl(30, 100%, 50%)';
            break;
          default:
            edgeColor = bgColor = 'hsl(0, 0%, 50%)'; // 未知のブロックタイプのデフォルト色
        }
      }
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = `${x * 24}px`;
      div.style.top = `${y * 24}px`;
      div.style.width = '24px';
      div.style.height = '24px';
      div.style.boxSizing = 'border-box';
      div.style.border = `2px ridge ${edgeColor}`;
      div.style.backgroundColor = bgColor;
      document.body.appendChild(div);
    }
  }
};

const blockShapes = [
  [0, []],
  [2, [-1, 0], [1, 0], [2, 0]], //tetris
  [2, [-1, 0], [0, 1], [1, 1]], //key 1
  [2, [-1, 0], [0, -1], [1, -1]], //key 2
  [1, [0, 1], [1, 0], [1, 1]], // square
  [4, [-1, 0], [1, 0], [1, 1]], //L1
  [4, [-1, 0], [1, 0], [0, -1]], //L2
  [4, [-1, 0], [0, 1], [0, -1]], //L2
];

const putBlock = (blockIndex, x, y, rotation, remove = false, action = false) => {
  const blockShape = [...blockShapes[blockIndex]];
  const rotateMax = blockShape.shift();
  blockShape.unshift([0, 0]);
  for (let [dy, dx] of blockShape) {
    for (let i = 0; i < rotation % rotateMax; i++) {
      [dx, dy] = [dy, -dx];
    }
    if (remove) {
      board[y + dy][x + dx] = 0;
    } else {
      if (board[y + dy][x + dx]) {
        return false;
      }
      if (action) {
        board[y + dy][x + dx] = blockIndex;
      }
    }
  }
  if (!action) {
    putBlock(blockIndex, x, y, rotation, remove, true);
  }
  return true;
};

let cx = 4,
  cy = 0,
  cr = 0,
  ci = 5,
  gameover = false;

const move = (dx, dy, dr) => {
  putBlock(ci, cx, cy, cr, true);
  if (putBlock(ci, cx + dx, cy + dy, cr + dr)) {
    cx += dx;
    cy += dy;
    cr += dr;
    showBoard();
    return true;
  } else {
    putBlock(ci, cx, cy, cr);
    return false;
  }
};

const createNewBlock = () => {
  clearLine();
  ci = Math.trunc(Math.random() * 7 + 1);
  cr = Math.trunc(Math.random() * 4);
  cx = 4;
  cy = 0;
  if (!putBlock(ci, cx, cy, cr)) {
    gameover = true;
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        if (board[y][x]) {
          board[y][x] = 5;
        }
      }
    }
    showBoard();
  }
};

const clearLine = () => {
  for (y = 0; y < 20; y++) {
    let removable = true;
    for (x = 0; x < 10; x++) {
      if (board[y][x] === 0) {
        removable = false;
        break;
      }
    }
    if (removable) {
      for (let j = y; j >= -1; j--) {
        for (let x = 0; x < 10; x++) {
          board[j][x] = j === -1 ? 0 : board[j - 1][x];
        }
      }
      y--;
    }
  }
};

window.onload = () => {
  createNewBlock();

  setInterval(() => {
    if (gameover) {
      return;
    }
    if (!move(0, 1, 0)) {
      createNewBlock();
    }
  }, 1000);

  document.onkeydown = (e) => {
    if (gameover) return;
    switch (e.key) {
      case 'ArrowLeft':
        move(-1, 0, 0);
        break;
      case 'ArrowRight':
        move(1, 0, 0);
        break;
      case 'ArrowUp':
        move(0, 0, 1);
        break;
      case 'ArrowDown':
        if (!move(0, 1, 0)) {
          createNewBlock();
        }
        break;
      default:
        break;
    }
  };

  // ゲームコンテナを取得します
  const gameContainer = document.getElementById('gameContainer');

  // タッチイベントリスナーを追加します
  gameContainer.addEventListener('touchstart', handleTouchStart, false);
  gameContainer.addEventListener(
    'touchmove',
    function (evt) {
      // evt.preventDefault(); // Pull-to-Refreshを無効化します
      handleTouchMove(evt); // スワイプ操作を処理します
    },
    { passive: false }
  ); // パッシブリスナーを無効にします

  let xDown = null;
  let yDown = null;

  function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        /* 左スワイプ */
        move(-1, 0, 0);
      } else {
        /* 右スワイプ */
        move(1, 0, 0);
      }
    } else {
      if (yDiff > 0) {
        /* 上スワイプ */
        move(0, 0, 1);
      } else {
        /* 下スワイプ */
        if (!move(0, 1, 0)) {
          createNewBlock();
        }
      }
    }

    /* 値をリセットします */
    xDown = null;
    yDown = null;
  }
};
