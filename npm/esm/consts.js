export var LineType;
(function (LineType) {
    LineType[LineType["Meta"] = 0] = "Meta";
    LineType[LineType["Part"] = 1] = "Part";
    LineType[LineType["Line"] = 2] = "Line";
    LineType[LineType["Triangle"] = 3] = "Triangle";
    LineType[LineType["Quad"] = 4] = "Quad";
    LineType[LineType["OptionalLine"] = 5] = "OptionalLine";
})(LineType || (LineType = {}));
export const ROOT_MODEL = "__root__";
