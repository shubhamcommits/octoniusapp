# CHANGES MADE IN FOLIO EDITOR
1. Migrated to Quill2.0
2. Comments section was added
3. Table plugin was integrated
4. Mentions functionality was added to comments section
5. Upload file feature is added

# POINTS TO BE NOTED
1. Javascript files are being used instead of NPM packages as quill2.0 has no stable version for angular
2. Quill1.0 and Quill2.0 were creating conflicts due to common name `Quill` so the export name of Quill2.0 had to be changed to `Quill2` from `Quill`
3. To use any plugin with Quill2.0 make sure its registered to `Quill2` variable

# TODO WHEN RUNNING APPLICATION
1. Install libreoffice to the system for upload file to work