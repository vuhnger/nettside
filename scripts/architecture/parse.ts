import ts from "typescript";

export type ParsedModule = {
  specifiers: string[];
  directive: string | null;
};

/**
 * Henter ut modulspesifikatorer og et eventuelt ledende direktiv.
 *
 * Bruker TypeScript-kompilatorens egen parser framfor regex. Det koster
 * ingenting - `typescript` ligger allerede i devDependencies - og det er
 * forskjellen på å finne alle importformene og å finne de fleste:
 * `export ... from`, `import type` og `await import()` ser ikke like ut for et
 * regex, men er alle ImportDeclaration/ExportDeclaration/ImportKeyword i AST-et.
 *
 * Direktivet må stå som første setning for at Next skal godta det, så vi leter
 * bare der. En `"use client"` lenger ned i filen er en vanlig streng, og skal
 * ikke tolkes som noe annet her heller.
 */
export function parseModule(source: string, fileName: string): ParsedModule {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const specifiers: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);

  const [first] = sourceFile.statements;
  const directive =
    first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression)
      ? first.expression.text
      : null;

  return { specifiers, directive };
}
