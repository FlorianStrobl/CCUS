# CCUS language definition

## Version 1.0.0 (2021-2022)

CCUS is the name of any implementation of this language. It is an abbreviation for CC (me), universal and speed or simple.
The definition tries to solve any problem with abstraction of hardware or software concepts, while remaining simple, fast to write code and not limiting low-level access of the language itself or given hardware.

The language syntax and features is inspired by the following existing programming languages: [TypeScript](https://www.typescriptlang.org/), [C/C++](https://isocpp.org/) and [C#](https://docs.microsoft.com/de-de/dotnet/csharp/).

An example of CCUS code for the mathematical function `f(x) = 2x` (f of x is 2 times x) would be:

```
func f(num x) {
  ret 2 * x;
}
```
