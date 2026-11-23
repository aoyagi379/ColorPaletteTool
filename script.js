
let colors = [
    "#A8C5BA",
    "#E8D8B9",
    "#C8B6D8"
];

// HTMLの要素を取得
const paletteContainer = document.getElementById("palette-container");

const addColorButton = document.getElementById("add-color");
const removeColorButton = document.getElementById("remove-color");

const paletteNameInput = document.getElementById("palette-name");
const savePaletteButton = document.getElementById("save-palette");
const saveMessage = document.getElementById("save-message");
const savedPalettesContainer = document.getElementById("saved-palettes");

// 保存データの識別名
const STORAGE_KEY = "colorPaletteTool_palettes";

// 保存データを読み込む関数
function getSavedPalettes() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);

        if (data === null) {
            return [];
        }

        const palettes = JSON.parse(data);

        if (!Array.isArray(palettes)) {
            throw new Error("保存データの形式が正しくありません。");
        }

        return palettes;
    } catch (error) {
        console.error("読み込みエラー:", error);
        saveMessage.textContent = "保存データを読み込めませんでした。";
        return null;
    }
}

// 保存データを書き込む関数
function writeSavedPalettes(palettes) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(palettes)
        );
        return true;
    } catch (error) {
        console.error("保存エラー:", error);
        saveMessage.textContent = "保存に失敗しました。";
        return false;
    }
}

// 現在のパレットを表示する関数
function displayPalette() {
    paletteContainer.innerHTML = "";

    colors.forEach(function(color, index) {

        const colorBlock = document.createElement("div");
        colorBlock.className = "color-block";

        const colorPreview = document.createElement("div");
        colorPreview.className = "color-preview";
        colorPreview.style.backgroundColor = color;

        const colorCode = document.createElement("div");
        colorCode.className = "color-code";
        colorCode.textContent = color;

        const colorControl = document.createElement("div");
        colorControl.className = "color-control";

        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.className = "color-picker";
        colorPicker.value = color;
        colorPicker.setAttribute(
            "aria-label",
            `${index + 1}番目の色を選択`
        );

        colorPicker.addEventListener("input", function() {
            colors[index] = colorPicker.value;
            colorPreview.style.backgroundColor = colors[index];
            colorCode.textContent = colors[index];
        });

        colorControl.appendChild(colorPicker);

        colorBlock.appendChild(colorPreview);
        colorBlock.appendChild(colorCode);
        colorBlock.appendChild(colorControl);

        paletteContainer.appendChild(colorBlock);
    });

    addColorButton.disabled = colors.length >= 5;
    removeColorButton.disabled = colors.length <= 3;
}

// 色を増やす
addColorButton.addEventListener("click", function() {
    if (colors.length < 5) {
        colors.push("#B7C9E2");
        displayPalette();
    }
});

// 色を減らす
removeColorButton.addEventListener("click", function() {
    if (colors.length > 3) {
        colors.pop();
        displayPalette();
    }
});

// 現在のパレットを保存
savePaletteButton.addEventListener("click", function() {
    const name = paletteNameInput.value.trim();

    if (name === "") {
        saveMessage.textContent = "パレット名を入力してください。";
        return;
    }

    const palettes = getSavedPalettes();

    if (palettes === null) {
        return;
    }

    const newPalette = {
        id: crypto.randomUUID(),
        name: name,
        colors: [...colors]
    };

    palettes.push(newPalette);

    if (writeSavedPalettes(palettes)) {
        paletteNameInput.value = "";
        saveMessage.textContent = "パレットを保存しました！";
        displaySavedPalettes();
    }
});

// 保存したパレットの一覧を表示
function displaySavedPalettes() {
    savedPalettesContainer.innerHTML = "";

    const palettes = getSavedPalettes();

    if (palettes === null) {
        return;
    }

    if (palettes.length === 0) {
        savedPalettesContainer.textContent =
            "まだ保存されたパレットはありません。";
        return;
    }

    palettes.forEach(function(palette) {

        const item = document.createElement("div");
        item.className = "saved-palette";

        const name = document.createElement("p");
        name.className = "saved-palette-name";
        name.textContent = palette.name;

        const preview = document.createElement("div");
        preview.className = "saved-palette-colors";

        palette.colors.forEach(function(color) {
            const block = document.createElement("div");
            block.className = "saved-color";
            block.style.backgroundColor = color;
            preview.appendChild(block);
        });

        // 読み込みボタン
        const loadButton = document.createElement("button");
        loadButton.className = "load-palette";
        loadButton.textContent = "読み込む";

        loadButton.addEventListener("click", function() {
            colors = [...palette.colors];
            displayPalette();

            paletteNameInput.value = palette.name;
            saveMessage.textContent =
                "パレット「" + palette.name + "」を読み込みました。";
        });

        // 削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-palette";
        deleteButton.textContent = "削除";

        deleteButton.addEventListener("click", function() {
            const confirmed = confirm(
                "「" + palette.name + "」を削除しますか？"
            );

            if (!confirmed) {
                return;
            }

            const currentPalettes = getSavedPalettes();

            if (currentPalettes === null) {
                return;
            }

            const remaining = currentPalettes.filter(
                function(saved) {
                    return saved.id !== palette.id;
                }
            );

            if (writeSavedPalettes(remaining)) {
                saveMessage.textContent =
                    "パレットを削除しました。";
                displaySavedPalettes();
            }
        });

        item.appendChild(name);
        item.appendChild(preview);
        item.appendChild(loadButton);
        item.appendChild(deleteButton);

        savedPalettesContainer.appendChild(item);
    });
}

// 初期表示
displayPalette();
displaySavedPalettes();