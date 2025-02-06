# TerraKit

TypeScript-powered Infrastructure as Code (Backed by CDKTF)

> This initial release is aimed at gathering **feedback** before refining further.

## Features

- **Override Resource Type** – Users can define resources in a stack (equivalent to a Terraform root module) and override them as needed.
- **Type-Safe** – Ensuring safe overrides and configuration within TypeScript.

## Starter Project

Checkout the [starter project](https://github.com/thaitype/terrakit-starter) to get started with TerraKit.

## Run Examples

```
make examples basic get
make examples basic synth
```

### Clean all Examples built files

```
make clean-all
```