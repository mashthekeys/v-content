
export function notifyAdminMiddleware(notifyAdmin) {
  return (req, res, next) => {
    const console = res.console;

    console.flush = function () {
      if (this.$notifyAdmin) {
        let data;

        try {

          data = String(console.read());

        } catch (error) {
          try {
            data = String(error);
          } catch (error) {
            data = "...error...";
          }
        }

        if (data !== "") {
          notifyAdmin(req, res, data);
        }
      }

      // Call super.flush()
      Object.getPrototypeOf(console).flush.call(console);
    };

    next();
  };
}
