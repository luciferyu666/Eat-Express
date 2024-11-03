import { storeAuthToken } from "@utils/tokenStorage";
/**
 * @fileoverview This jscodeshift script replaces incorrect imports of `Roles` to import from '@shared/roles'.
 *
 * Usage:
 * jscodeshift -t fix-roles-imports.js src
 */

export default function transformer(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
  
    // Define the correct import source
    const correctImportSource = '@shared/roles';
  
    // Find all import declarations that import 'Roles' from incorrect paths
    root.find(j.ImportDeclaration)
      .filter((path) => {
        const importSource = path.node.source.value;
        // Exclude the correct import source
        if (importSource === correctImportSource) return false;
        // Check if 'Roles' is being imported
        return path.node.specifiers.some(
          (specifier) =>
            (specifier.type === 'ImportSpecifier' &&
              (specifier.imported.name === 'Roles' || specifier.local.name === 'Roles')) ||
            (specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'Roles')
        );
      })
      .forEach((path) => {
        // Find the specifier(s) for 'Roles'
        const rolesSpecifiers = path.node.specifiers.filter(
          (specifier) =>
            (specifier.type === 'ImportSpecifier' &&
              (specifier.imported.name === 'Roles' || specifier.local.name === 'Roles')) ||
            (specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'Roles')
        );
  
        if (rolesSpecifiers.length > 0) {
          // Remove 'Roles' specifier(s) from the original import
          path.node.specifiers = path.node.specifiers.filter(
            (specifier) => !rolesSpecifiers.includes(specifier)
          );
  
          // If the original import has no specifiers left, remove the entire import declaration
          if (path.node.specifiers.length === 0) {
            j(path).remove();
          }
  
          // Insert or update the import from '@shared/roles'
          const existingSharedRolesImport = root.find(j.ImportDeclaration, {
            source: { value: correctImportSource },
          });
  
          if (existingSharedRolesImport.size() > 0) {
            // If an import from '@shared/roles' already exists, add 'Roles' to its specifiers if not already imported
            existingSharedRolesImport.forEach((importPath) => {
              const hasRolesSpecifier = importPath.node.specifiers.some(
                (specifier) =>
                  (specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'Roles') ||
                  (specifier.type === 'ImportSpecifier' &&
                    (specifier.imported.name === 'Roles' || specifier.local.name === 'Roles'))
              );
              if (!hasRolesSpecifier) {
                importPath.node.specifiers.push(
                  j.importDefaultSpecifier(j.identifier('Roles'))
                );
              }
            });
          } else {
            // Insert the correct import for 'Roles' at the top of the file
            const newImport = j.importDeclaration(
              [j.importDefaultSpecifier(j.identifier('Roles'))],
              j.literal(correctImportSource)
            );
            // Place the new import after any existing import statements
            const firstImport = root.find(j.ImportDeclaration).at(0);
            if (firstImport.size() > 0) {
              firstImport.insertBefore(newImport);
            } else {
              root.get().node.program.body.unshift(newImport);
            }
          }
        }
      });
  
    return root.toSource({ quote: 'single' });
  }