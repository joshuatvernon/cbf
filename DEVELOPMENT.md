# Development

## Getting started

Install `cbf` globally
```sh
$ npm install cbf -g
```

## Setup editor
Install `editorconfig` and `prettier` plugins in your editor 

## Turn on errors

Output errors by adding `NODE_ENV=test` when running `cbf`
```sh
$ NODE_ENV=test cbf
```

## Deployment

`cbf` is deployed from `master` branch when a new tag is merged.  

### Update tag

Use `cbf` to update the npm tag 
```sh
$ cbf
  -> npm
     --> version
         --> patch / minor / major
```

### Update changelog

Install [git-chglog](https://github.com/git-chglog/git-chglog) and run: 

```sh
$ cbf
  --> update-changelog
```
