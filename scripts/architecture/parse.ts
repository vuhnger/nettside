import ts from "typescript";

export type ParsedModule = {
  specifiers: string[];
  directive: string | null;
};

/**
 * True for importer og eksporter som forsvinner under kompilering.
 *
 * `import type`, `import { type Foo }` og `export type { Foo } from` finnes
 * ikke i den ferdige koden, så de er ikke kanter i en graf som skal svare på
 * hva nettleseren laster ned. Uten dette skillet fikk `components/master/edge/
 * types.ts` - en fil som bare inneholder typedeklarasjoner og kompilerer til
 * ingenting - stå som klientkode i grafen.
 *
 * Tvilstilfeller regnes som verdi-import. Retningen er ikke tilfeldig: en kant
 * for mye gjør grafen litt for pessimistisk, mens en kant for lite kan la
 * serverkode gli inn i klientbunten uten at porten i
 * `architecture-rules.test.ts` merker det.
 */
function isTypeOnly(node: ts.ImportDeclaration | ts.ExportDeclaration): boolean {
  if (ts.isExportDeclaration(node)) {
    if (node.isTypeOnly) return true;
    const clause = node.exportClause;
    // `export * from` tar med verdiene også.
    if (!clause || !ts.isNamedExports(clause) || clause.elements.length === 0) return false;
    return clause.elements.every((element) => element.isTypeOnly);
  }

  const clause = node.importClause;
  // `import "./styles.css"` har ingen bindinger og kjøres for effekten sin.
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  // En default-import er alltid en verdi.
  if (clause.name) return false;

  const bindings = clause.namedBindings;
  if (!bindings || !ts.isNamedImports(bindings) || bindings.elements.length === 0) return false;
  return bindings.elements.every((element) => element.isTypeOnly);
}

/**
 * Henter ut modulspesifikatorer og et eventuelt ledende direktiv.
 *
 * Bruker TypeScript-kompilatorens egen parser framfor regex. Det koster
 * ingenting - `typescript` ligger allerede i devDependencies - og det er
 * forskjellen på å finne alle importformene og å finne de fleste:
 * `export ... from`, `import type` og `await import()` ser ikke like ut for et
 * regex, men er alle ImportDeclaration/ExportDeclaration/ImportKeyword i AST-et.
 * Å skille verdi fra type krever uansett en parser.
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
      ts.isStringLiteral(node.moduleSpecifier) &&
      !isTypeOnly(node)
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
