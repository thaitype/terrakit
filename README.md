# TerraKit

TypeScript-powered Infrastructure as Code (Backed by CDKTF)

## Example

```
make examples basic get
make examples basic synth
```

### Clean all Examples built files

```
make clean-all
```

## CDKTF Documentation

- CDKTF Concept: https://developer.hashicorp.com/terraform/cdktf/concepts/cdktf-architecture
- CDKTF Multiple Stack: https://developer.hashicorp.com/terraform/cdktf/concepts/stacks#multiple-stacks
- CDKTF Import Resource: https://developer.hashicorp.com/terraform/cdktf/concepts/resources#importing-resources
- CDKTF Provider: https://developer.hashicorp.com/terraform/cdktf/concepts/providers
    - Best Practice: https://developer.hashicorp.com/terraform/cdktf/create-and-deploy/best-practices#providers
- CDKTF Terraform Variable (HCL Syntax): https://developer.hashicorp.com/terraform/cdktf/concepts/variables-and-outputs#define-complex-input-variables
    - การเข้าถึง Variable ที่เป็น `object` Type: https://developer.hashicorp.com/terraform/cdktf/concepts/functions#property-access-helpers
- CDKTF Use Construct: https://developer.hashicorp.com/terraform/cdktf/concepts/constructs#use-constructs
- CDKTF Unit Test: https://developer.hashicorp.com/terraform/cdktf/test/unit-tests
    - ตัวอย่าง https://spacelift.io/blog/terraform-test

## References

- https://github.com/thaitype/saiphan