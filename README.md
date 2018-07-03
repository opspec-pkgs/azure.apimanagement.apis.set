[![Build Status](https://travis-ci.org/opspec-pkgs/azure.apimanagement.apis.set.svg?branch=master)](https://travis-ci.org/opspec-pkgs/azure.apimanagement.apis.set)

<img src="icon.svg" alt="icon" height="100px">

# Problem statement

Sets Azure API Management apis

Apis MUST be provided in the form of the following conventional dir structure:
```text
  |--
    |-- apis
      |-- {api-name} # repeat as needed
        |-- swagger.json
```
> Each `{api-name}` folder MUST contain a `swagger.json` and requires `"x-basePath": "<path>"` extension definition at
> the root level. 
  
see [example](example).


# Format

the op uses [![opspec 0.1.5](https://img.shields.io/badge/opspec-0.1.5-brightgreen.svg?colorA=6b6b6b&colorB=fc16be)](https://opspec.io/0.1.5) definition format

# Example usage

## Install

```shell
opctl op install github.com/opspec-pkgs/azure.apimanagement.apis.set#1.1.0
```

## Run

```
opctl run github.com/opspec-pkgs/azure.apimanagement.apis.set#1.1.0
```

## Compose

```yaml
op:
  ref: github.com/opspec-pkgs/azure.apimanagement.apis.set#1.1.0
  inputs:
    apiCredentialsKey:
    apiManagementServiceName:
    apis:
    loginId:
    loginSecret:
    loginTenantId:
    resourceGroup:
    subscriptionId:
    # params w/ default
    accessTokenMinutesValid:
    apiCredentialsIdentifier:
    contentType:
    loginType:
    variables:
```

# Support

join us on
[![Slack](https://opctl-slackin.herokuapp.com/badge.svg)](https://opctl-slackin.herokuapp.com/)
or
[open an issue](https://github.com/opspec-pkgs/azure.apimanagement.apis.set/issues)

# Releases

releases are versioned according to
[![semver 2.0.0](https://img.shields.io/badge/semver-2.0.0-brightgreen.svg)](http://semver.org/spec/v2.0.0.html)
and [tagged](https://git-scm.com/book/en/v2/Git-Basics-Tagging); see
[CHANGELOG.md](CHANGELOG.md) for release notes

# Contributing

see
[project/CONTRIBUTING.md](https://github.com/opspec-pkgs/project/blob/master/CONTRIBUTING.md)
