import {VBtn, VIcon, VMenu, VTooltip} from "vuetify/lib/components";
import TagIcon from "@/backend/components/cms/content/TagIcon.js";

export default {
  name: "CMSTagMenu",

  props: {
    enable: {},
    value: {},
  },

  data() {
    return {
      isDeleting: false,
    };
  },

  render() {
    const dark = this.$vuetify.theme.dark;

    const {enable, isDeleting, value} = this;

    const tag = String(value[0]);

    let pasteButton;

    if (enable?.paste) {
      pasteButton = this.$createElement(VBtn, {
        props: {
          icon: true,
          tile: true,
        },
        on: {
          click: () => this.$emit("paste"),
        },
      }, [
        this.$createElement(VIcon, {}, "mdi-content-paste")
      ]);
    } else {
      const isMac = /Mac/.test(window.navigator.platform);

      const modifierKey = isMac ? "⌘" : "Ctrl";

      pasteButton = this.$createElement(VTooltip,
        {
          props: {
            right: true,
          },
          scopedSlots: {
            activator: ({attrs, on}) => this.$createElement(VBtn, {
              props: {
                icon: true,
                color: "grey",
                ripple: false,
                tile: true,
              },
              attrs,
              on,
            }, [
              this.$createElement(VIcon, {}, "mdi-content-paste")
            ]),
          },
        },
        [
          "Press",
          this.$createElement("big", [
            " ",
            this.$createElement("kbd", {style: {fontWeight: "bold"}}, modifierKey),
            " ",
            this.$createElement("kbd", {style: {fontWeight: "bold"}}, "V"),
          ]),
        ]
      );
    }

    return this.$createElement("div", [
      this.$createElement(VMenu, {
        props: {
          right: true,
          nudgeTop: 36,
          nudgeRight: 36,
        },
        on: {
          input: () => {
            this.isDeleting = false;

            this.$emit("toggle");
          },
        },
        scopedSlots: {
          activator: ({attrs, on}) => this.$createElement(VBtn, {
            attrs,
            on,
            props: {
              icon: true,
              tile: true,
            },
          }, [
            this.$createElement(TagIcon, {props: {value: tag}})
          ]),
        }
      }, [
        this.$createElement("div", {
            style: {
              background: dark ? "black" : "white",
            },
          },
          [
            this.$createElement("div", [
              this.$createElement(VBtn, {
                props: {
                  icon: true,
                  tile: true,
                },
                on: {
                  click: () => this.$emit("move", "up"),
                },
              }, [
                this.$createElement(VIcon, {}, "mdi-arrow-up")
              ]),
              this.$createElement(VBtn, {
                props: {
                  disabled: !(enable?.cut),
                  icon: true,
                  tile: true,
                },
                on: {
                  click: () => this.$emit("cut"),
                },
              }, [
                this.$createElement(VIcon, {}, "mdi-content-cut")
              ]),
            ]),
            this.$createElement("div", [
              this.$createElement(VBtn, {
                props: {
                  icon: true,
                  tile: true,
                },
                on: {
                  click: () => this.$emit("properties"),
                },
              }, [
                this.$createElement(VIcon, {}, "mdi-cog")
              ]),
              this.$createElement(VBtn, {
                props: {
                  disabled: !(enable?.copy),
                  icon: true,
                  tile: true,
                },
                on: {
                  click: () => this.$emit("copy"),
                },
              }, [
                this.$createElement(VIcon, {}, "mdi-content-copy")
              ]),
            ]),
            this.$createElement("div", [
              this.$createElement(VBtn, {
                props: {
                  icon: true,
                  tile: true,
                },
                on: {
                  click: () => this.$emit("move", "down"),
                },
              }, [
                this.$createElement(VIcon, {}, "mdi-arrow-down")
              ]),
              pasteButton,
            ]),
            this.$createElement("div", [
              this.$createElement(VBtn, {
                props: {
                  icon: true,
                  tile: true,
                },
                on: {
                  click: () => this.$emit("insert", "after"),
                },
              }, [
                this.$createElement(VIcon, {}, "mdi-plus")
              ]),
              this.$createElement(VBtn, {
                style: {
                  overflow: 'hidden',
                },
                props: {
                  icon: true,
                  tile: true,
                  color: isDeleting ? 'red' : void '',
                },
                on: {
                  click: ($event) => {
                    if (isDeleting) {
                      this.$emit("delete");
                    } else {
                      this.isDeleting = true;
                      $event.preventDefault();
                      $event.stopImmediatePropagation();
                    }
                  },
                },
              }, [
                this.$createElement(VIcon, {
                  style: {
                    animation: isDeleting ? 'cms-ui-pulse 1.8s infinite running' : void '',
                  },
                }, "mdi-delete")
              ]),
            ]),
          ])
      ]
      )
    ]);
  },
}