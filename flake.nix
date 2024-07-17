# Use: nix develop
#
# To automatically activate the flake when entering the directory,
# install direnv and enable it with `direnv allow`.

{
  inputs = {
    # github:NixOS/nixpkgs/nixos-23.11 contains nodejs 20.11.1, we are still on 20.10.0
    # We need to use the commit for the correct nodejs 20.10.0 from here: https://www.nixhub.io/packages/nodejs
    # nixpkgs.url =
    #   "github:NixOS/nixpkgs/dd5621df6dcb90122b50da5ec31c411a0de3e538";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = with pkgs;
          mkShell { buildInputs = [ git nodejs pnpm patchutils_0_4_2 ]; };
      });
}
