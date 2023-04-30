
const cms = [
];


const html = (
[{"name":"blockquote","display":"block","class":{"html-blockquote":true}},{"name":"div","display":"block","style":{}},{"name":"dl","display":"block"},{"name":"h1","display":"block","style":{"fontWeight":"900","fontSize":"1.6rem"}},{"name":"h2","display":"block","style":{"fontWeight":"900","fontSize":"1.5rem"}},{"name":"h3","display":"block","style":{"fontWeight":"900","fontSize":"1.4rem"}},{"name":"h4","display":"block","style":{"fontWeight":"bold","fontSize":"1.3rem"}},{"name":"h5","display":"block","style":{"fontWeight":"bold","fontSize":"1.2rem"}},{"name":"h6","display":"block","style":{"fontWeight":"bold","fontSize":"1.1rem"}},{"name":"ol","display":"block"},{"name":"p","display":"block","style":{"marginTop":"0.25em","marginBottom":"0.25em"}},{"name":"pre","display":"block","style":{"fontFamily":"monospace","whiteSpace":"pre"}},{"name":"ul","display":"block"},{"name":"a","display":"inline","style":{"textDecoration":"dashed underline blue"}},{"name":"abbr","display":"inline","style":{"textDecoration":"dotted underline"}},{"name":"acronym","display":"inline","style":{"textDecoration":"dotted underline"}},{"name":"b","display":"inline","style":{"fontWeight":"bold"}},{"name":"big","display":"inline","style":{"fontSize":"105%"}},{"name":"cite","display":"inline","style":{}},{"name":"code","display":"inline","style":{"fontFamily":"monospace"}},{"name":"del","display":"inline","style":{"textDecoration":"dotted strikethrough red","opacity":"0.8"}},{"name":"em","display":"inline","style":{"fontStyle":"italic"}},{"name":"i","display":"inline","style":{"fontStyle":"italic"}},{"name":"ins","display":"inline","style":{"textDecoration":"dotted underline green"}},{"name":"kbd","display":"inline","style":{"fontWeight":"bold"}},{"name":"mark","display":"inline","style":{"backgroundColor":"yellow"}},{"name":"q","display":"inline","class":{"html-q":true}},{"name":"s","display":"inline","style":{"textDecoration":"strikethrough"}},{"name":"samp","display":"inline","style":{"fontFamily":"monospace"}},{"name":"small","display":"inline","style":{"fontSize":"95.2%"}},{"name":"span","display":"inline","style":{}},{"name":"strong","display":"inline","style":{"fontWeight":"bold"}},{"name":"sub","display":"inline","style":{"verticalAlign":"sub","fontSize":"83%"}},{"name":"sup","display":"inline","style":{"verticalAlign":"super","fontSize":"83%"}},{"name":"u","display":"inline","style":{"textDecoration":"underline"}},{"name":"tt","display":"inline","style":{"fontFamily":"monospace"}},{"name":"var","display":"inline","style":{"fontStyle":"italic"}},{"name":"br","display":"inline","void":true},{"name":"details","display":"block"},{"name":"hr","display":"block","void":true},{"name":"table","display":"block"},{"name":"article","display":"block"},{"name":"aside","display":"block"},{"name":"section","display":"block"}]
).map(
  ({name}) => name
);

html.push(
  // Table innards
  "td", "th", "tr", "thead", "tbody", "tfoot", "caption",
  // List innards
  "li", "dt", "dd",
  // Graphics
  "img", "picture", "source",
);

export const tags = {
  html,
  cms
};

function kebabCase(str) {
  return String(str).replace(/^[A-Z]/, letter => letter.toLowerCase()).replace(/[A-Z]/g, letter => "-" + letter.toLowerCase())
}

const all = Object.entries(tags).reduce(
  (all, [namespace, components]) => all.concat(
    components.map(component => {
      if (namespace === "html") {
        return [component, component];
      } else {
        return [namespace + ":" + kebabCase(component.name), component];
      }
    })
  ),
  []
);

export default all;

