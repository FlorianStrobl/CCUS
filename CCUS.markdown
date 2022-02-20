# CCUS language definition

## Version 1.0.0 (2021-2022)

CCUS stands for CC (me), universal and speed or simple.
The language was defined to be able problems with any abstraction of hardware and software while remaining simple and fast to developp in it.

The language is heavily inspired by the programming languages: [TypeScript](https://www.typescriptlang.org), [C/C++](https://gcc.gnu.org/) and [C#](https://docs.microsoft.com/de-de/dotnet/csharp/) from their syntax and structures.

Example Code for a function `f(x) = 2x`:

```
func f(num x)
{
  ret 2 * x;
}
```

...

Any code none comform to the standart will have per definition undefined behaviour for implementations of this language.

Language core ideas:
The language trys to be able to solve any kind of problem in the most efficient way possible.
The definition of "problem" is in this case every problem which can be solved by a turing machine.
The definition of efficient has different answers:
It is first and for most the speed in time and the space in bytes of the starting of the problem to the end/solution of the problem.
But then it has two other important things: maintainability to fix any bug (unintented behaviour) or inaccuracy, and to be able to add features. Both in an easy way.
