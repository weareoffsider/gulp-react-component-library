# Change Log

All notable changes to this project will be documented in this file.

## Unreleased Changes

## 1.3.1 - 2015-07-20
### Fixed
- Fixed pathing for incremental rebuild when listening to something other than
  the script files.

## 1.3.0 - 2015-07-20
### Added
- Added option for 'templates', which can define the base directory for all
  scripts, which allows you to use incremental rebuilding whilst watching
  test data or the script files themselves.

## 1.2.0 - 2015-07-17
### Added
- Added option for 'defaultProps', which can define some default properties
  passed to every component. Can be overwritten by data file props.

## 1.1.0 - 2015-07-01
### Added
- Children can be provided in data files.

## 1.0.0 - 2015-06-15
### Added
- Initial Gulp Plugin.
