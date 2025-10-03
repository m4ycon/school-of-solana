/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/crowdfunding.json`.
 */
export type Crowdfunding = {
  "address": "2YwZqidKUCJvQxpcuyqii4eT9hsPJcUbjZUZZVXukHVU",
  "metadata": {
    "name": "crowdfunding",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimCollected",
      "discriminator": [
        173,
        125,
        35,
        165,
        84,
        68,
        146,
        6
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "contribute",
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "contributor"
              },
              {
                "kind": "arg",
                "path": "amount"
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "account",
                "path": "project.contribution_id_counter",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProject",
      "discriminator": [
        69,
        126,
        215,
        37,
        20,
        60,
        73,
        235
      ],
      "accounts": [
        {
          "name": "projectOwner",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "projectOwner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initializeProjectArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Cannot initialize, title too long"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Cannot initialize, description too long"
    },
    {
      "code": 6002,
      "name": "goalMustBeGreaterThanZero",
      "msg": "Cannot initialize, goal must be greater than zero"
    },
    {
      "code": 6003,
      "name": "expiresAtMustBeGreaterThanNow",
      "msg": "Cannot initialize, expires at must be greater than now"
    },
    {
      "code": 6004,
      "name": "amountMustBeGreaterThanZero",
      "msg": "Cannot contribute, amount must be greater than zero"
    },
    {
      "code": 6005,
      "name": "tooEarlyToClaim",
      "msg": "Cannot claim, amount collected did not reach goal or project is not expired yet"
    },
    {
      "code": 6006,
      "name": "insufficientFundsToClaim",
      "msg": "Cannot claim, insufficient funds to claim"
    },
    {
      "code": 6007,
      "name": "alreadyClosed",
      "msg": "Project is already closed"
    }
  ],
  "types": [
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contributor",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "initializeProjectArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "amountGoal",
            "type": "u64"
          },
          {
            "name": "goalExpiresAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "amountGoal",
            "type": "u64"
          },
          {
            "name": "amountCollected",
            "type": "u64"
          },
          {
            "name": "goalExpiresAt",
            "type": "i64"
          },
          {
            "name": "closedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "contributionIdCounter",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
