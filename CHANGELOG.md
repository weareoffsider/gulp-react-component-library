# Change Log

All notable changes to this project will be documented in this file.

## Unreleased Changes

## 1.9.0 - 2015-11-07
### Added
- Support for 'default' React components being required in.

## 1.8.1 - 2015-10-30
### Fixed
- Dumy typo.

## 1.8.0 - 2015-10-30
### Added
- Ability to provide custom render function and page title getter.

## 1.7.0 - 2015-10-19
### Added
- Props Serializer can be customised (not just JSON.stringify, as by default).
  Can be changed with opts.propsSerializer

## 1.6.0 - 2015-10-16
### Added
- Jade Variables can be provided to the wrapper renderer via opts.jadeVariables

## 1.5.0 - 2015-09-20
### Added
- data option can be a function instead, so test data can be supplied in some
  other location (for example side by side with the component).

## 1.4.2 - 2015-07-29
### Added
- Exceptions catches added to callback stream, to allow better surfacing of
  errors to Gulp

## 1.4.1 - 2015-07-21
### Added
- Add ability to set prependStyleguide and appendStylegude on react components,
  which feeds into the component library render. This can be used to wrap
  components that cannot be rendered on their own without surrounding markup,
  such as table rows.

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
