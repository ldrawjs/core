"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOT_MODEL = exports.LineType = void 0;
var LineType;
(function (LineType) {
    LineType[LineType["Meta"] = 0] = "Meta";
    LineType[LineType["Part"] = 1] = "Part";
    LineType[LineType["Line"] = 2] = "Line";
    LineType[LineType["Triangle"] = 3] = "Triangle";
    LineType[LineType["Quad"] = 4] = "Quad";
    LineType[LineType["OptionalLine"] = 5] = "OptionalLine";
})(LineType = exports.LineType || (exports.LineType = {}));
exports.ROOT_MODEL = "__root__";
